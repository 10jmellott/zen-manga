import type { Manga, MangaChapter, MangaTag } from "~/types/manga";

async function fetchMangadex<T>(path: string, options?: RequestInit) {
	const apiUrl = `https://api.mangadex.org${path}`;
	try {
		const response = await fetchWithProxy(apiUrl, options);
		return await response.json() as T;
	} catch (error) {
		console.error(`Error fetching Mangadex data from ${apiUrl}`, error);
		return null as T;
	}
}

function tryGetCoverUrl(manga: MangadexManga): string {
	const coverArt = manga.relationships.find(r => r.type === "cover_art");
	if (coverArt) {
		return transformForProxy(`https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`);
	}
	return "";
}

function tryGetScanlationGroup(chapter: MangadexChapter): string {
	return chapter.relationships.find(r => r.type === "scanlation_group")?.attributes.name || "";
}

function tryGetEnglish(languageMap: LanguageMap): string {
	return languageMap.en || Object.values(languageMap)[0] || "";
}

function transformMangadexManga(manga: MangadexManga): Manga {
	return {
		id: manga.id,
		title: manga.attributes.title.en ?? manga.attributes.altTitles.filter(m => !!m.en)[0]?.en ?? tryGetEnglish(manga.attributes.title) ?? "Unknown Title",
		description: tryGetEnglish(manga.attributes.description),
		coverUrl: tryGetCoverUrl(manga),
		originalLanguage: manga.attributes.originalLanguage,
		status: manga.attributes.status,
		contentRating: manga.attributes.contentRating,
		tags: manga.attributes.tags.map(t => tryGetEnglish(t.attributes.name))
	} as Manga;
}

function transformMangaChapter(chapter: MangadexChapter): MangaChapter {
	return {
		id: chapter.id,
		volume: chapter.attributes.volume ? parseFloat(chapter.attributes.volume) : undefined,
		chapter: chapter.attributes.chapter ? parseFloat(chapter.attributes.chapter) : 0,
		title: chapter.attributes.title,
		scanlationGroup: tryGetScanlationGroup(chapter),
		externalUrl: chapter.attributes.externalUrl
	} as MangaChapter;
}

function transformMangaListResponse(response: MangadexCollection<MangadexManga>): Manga[] {
	return response.data.map(transformMangadexManga);
}

async function fetchMangaByUrl(params: string): Promise<Manga[]> {
	const manga = await fetchMangadex<MangadexCollection<MangadexManga>>(`/manga?${params}&includes[]=cover_art&hasAvailableChapters=true&availableTranslatedLanguage[]=en&limit=32`);
	if (manga) {
		return transformMangaListResponse(manga);
	}
	return [] as Manga[];
}

export async function fetchMangaList(seriesIds: string[]): Promise<Manga[]> {
	return fetchMangaByUrl(seriesIds.map(id => `&ids[]=${id}`).join(""));
}

export async function fetchLatestManga(): Promise<Manga[]> {
	return fetchMangaByUrl("order[latestUploadedChapter]=desc");
}

export async function fetchPopularManga(): Promise<Manga[]> {
	return fetchMangaByUrl("order[followedCount]=desc");
}

export async function fetchNewestManga(): Promise<Manga[]> {
	return fetchMangaByUrl("order[createdAt]=desc");
}

export async function fetchMangaById(id: string): Promise<Manga | null> {
	const manga = await fetchMangadex<MangaResponse>(`/manga/${id}?includes[]=cover_art`);
	if (manga) {
		return transformMangadexManga(manga.data);
	}
	return null;
}
export async function fetchMangaChaptersById(id: string, offset = 0, limit = 100): Promise<[MangaChapter[], number]> {
	const chapters = await fetchMangadex<MangadexCollection<MangadexChapter>>(`/manga/${id}/feed?includes[]=scanlation_group&translatedLanguage[]=en&limit=${limit}&offset=${offset}&order[volume]=desc&order[chapter]=desc`);
	if (chapters) {
		return [chapters.data.map(transformMangaChapter).toSorted((a, b) => (a.chapter < b.chapter ? 1 : -1)), chapters.total];
	}
	return [[], 0];
}

export async function fetchChapterImagesById(id: string): Promise<string[]> {
	const response = await fetchMangadex<AtHomeResponse>(`/at-home/server/${id}`);
	if (response) {
		return response.chapter.dataSaver.map(filename => transformForProxy(`${response.baseUrl}/data-saver/${response.chapter.hash}/${filename}`));
	}
	return [];
}

const mangaStatus = ["ongoing", "completed", "hiatus", "cancelled"];
const demographicTags = ["shounen", "shoujo", "seinen", "josei", "none"];
const contentRatings = ["safe", "suggestive", "erotica", "pornographic"];
export async function fetchTags(): Promise<MangaTag[]> {
	const response = await fetchMangadex<MangadexCollection<MangadexTag>>("/manga/tag");
	if (response) {
		return [
			...mangaStatus.map(status => ({ id: status, name: status, group: "status" })),
			...demographicTags.map(demo => ({ id: demo, name: demo, group: "demographic" })),
			...contentRatings.map(rating => ({ id: rating, name: rating, group: "content rating" })),
			...response.data.map(t => ({
				id: t.id,
				name: tryGetEnglish(t.attributes.name) ?? "Unknown Tag",
				group: t.attributes.group
			}))
		];
	}
	return [];
}

export async function searchManga(query: string, includedTags: MangaTag[] = [], excludedTags: MangaTag[] = []): Promise<Manga[]> {
	if (!query && includedTags.length === 0 && excludedTags.length === 0) {
		return [];
	}
	
	// Add the search query if it exists
	let params = "";
	if (query) {
		params = `&title=${encodeURIComponent(query)}`;
	}

	// Extract out status, demographic, and content rating tags to use the appropriate search parameters
	const statusTags = includedTags.filter(t => t.group === "status").map(t => t.id);
	const demographicTags = includedTags.filter(t => t.group === "demographic").map(t => t.id);
	const contentRatingTags = includedTags.filter(t => t.group === "content rating").map(t => t.id);
	if (statusTags.length > 0) {
		params += statusTags.map(s => `&status[]=${s}`).join("");
	}
	if (demographicTags.length > 0) {
		params += demographicTags.map(d => `&publicationDemographic[]=${d}`).join("");
	}
	if (contentRatingTags.length > 0) {
		params += contentRatingTags.map(c => `&contentRating[]=${c}`).join("");
	}

	// For other tags, we can only include/exclude them in the search results after fetching since the API doesn't support AND/NOT logic for tags
	const otherIncludedTagIds = includedTags.filter(t => t.group !== "status" && t.group !== "demographic" && t.group !== "content rating").map(t => t.id);
	const otherExcludedTagIds = excludedTags.filter(t => t.group !== "status" && t.group !== "demographic" && t.group !== "content rating").map(t => t.id);
	if (otherIncludedTagIds.length > 0) {
		params += otherIncludedTagIds.map(i => `&includedTags[]=${i}`).join("");
	}
	if (otherExcludedTagIds.length > 0) {
		params += otherExcludedTagIds.map(e => `&excludedTags[]=${e}`).join("");
	}

	return fetchMangaByUrl(params);
}

interface AtHomeResponse {
	baseUrl: string;
	chapter: {
		hash: string;
		data: string[];
		dataSaver: string[];
	};
}

interface MangadexChapter {
	id: string;
	attributes: ChapterAttributes;
	relationships: Relationship[];
}

interface ChapterAttributes {
	volume?: string;
	chapter: string;
	title?: string;
	externalUrl?: string;
}

interface MangaResponse {
	data: MangadexManga;
}

interface MangadexCollection<T> {
	data: T[];
	limit: number;
	offset: number;
	total: number;
}

interface MangadexItem<T> {
	id:            string;
	type:          string;
	attributes:    T;
	relationships: Relationship[];
}

interface MangadexManga extends MangadexItem<MangaAttributes> { }

interface MangadexTag extends MangadexItem<TagAttributes> { }

interface MangaAttributes {
    altTitles:        LanguageMap[];
    contentRating:    string;
    description:      LanguageMap;
    originalLanguage: string;
    status:           string;
    tags:             MangadexTag[];
    title:            LanguageMap;
}

interface LanguageMap {
    en?: string;
	ja?: string;
}

interface TagAttributes {
    name: LanguageMap;
	group: string;
}

interface Relationship {
    attributes: RelationshipAttributes;
    id:         string;
    type:       string;
}

interface RelationshipAttributes {
	name?: string;
    fileName?: string;
}
