import type { Manga, MangaChapter } from "~/types/manga";

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

function transformMangadexMangaWithChapters(manga: MangadexManga, chapters?: MangadexChapter[]): Manga {
	return {
		id: manga.id,
		title: manga.attributes.title.en ?? manga.attributes.altTitles.filter(m => !!m.en)[0]?.en ?? tryGetEnglish(manga.attributes.title) ?? "Unknown Title",
		description: tryGetEnglish(manga.attributes.description),
		coverUrl: tryGetCoverUrl(manga),
		originalLanguage: manga.attributes.originalLanguage,
		status: manga.attributes.status,
		contentRating: manga.attributes.contentRating,
		tags: manga.attributes.tags.map(t => tryGetEnglish(t.attributes.name)),
		chapters: chapters ? chapters.map(transformMangaChapter).toSorted((a, b) => (a.chapter < b.chapter ? 1 : -1)) : []
	} as Manga;
}

function transformMangadexManga(manga: MangadexManga): Manga {
	return transformMangadexMangaWithChapters(manga);
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

export async function fetchMangaList(seriesIds: string[]): Promise<Manga[]> {
	const manga = await fetchMangadex<MangadexCollection<MangadexManga>>("/manga?" + seriesIds.map(id => `&ids[]=${id}`).join("") + "&includes[]=cover_art");
	if (manga) {
		return transformMangaListResponse(manga);
	}
	return [] as Manga[];
}

export async function fetchLatestManga(): Promise<Manga[]> {
	const manga = await fetchMangadex<MangadexCollection<MangadexManga>>("/manga?hasAvailableChapters=true&order[latestUploadedChapter]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en&limit=32");
	if (manga) {
		return transformMangaListResponse(manga);
	}
	return [] as Manga[];
}

export async function fetchPopularManga(): Promise<Manga[]> {
	const manga = await fetchMangadex<MangadexCollection<MangadexManga>>("/manga?hasAvailableChapters=true&order[followedCount]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en&limit=32");
	if (manga) {
		return transformMangaListResponse(manga);
	}
	return [] as Manga[];
}

export async function fetchNewestManga(): Promise<Manga[]> {
	const manga = await fetchMangadex<MangadexCollection<MangadexManga>>("/manga?hasAvailableChapters=true&order[createdAt]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en&limit=32");
	if (manga) {
		return transformMangaListResponse(manga);
	}
	return [] as Manga[];
}

export async function fetchMangaById(id: string): Promise<Manga | null> {
	const manga = await fetchMangadex<MangaResponse>(`/manga/${id}?includes[]=cover_art`);
	if (manga) {
		const chapters = await fetchMangadex<MangadexCollection<MangadexChapter>>(`/manga/${id}/feed?includes[]=scanlation_group&translatedLanguage[]=en&limit=100`);
		return transformMangadexMangaWithChapters(manga.data, chapters.data);
	}
	return null;
}

export async function fetchChapterImagesById(id: string): Promise<string[]> {
	const response = await fetchMangadex<AtHomeResponse>(`/at-home/server/${id}`);
	if (response) {
		return response.chapter.dataSaver.map(filename => transformForProxy(`${response.baseUrl}/data-saver/${response.chapter.hash}/${filename}`));
	}
	return [];
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

interface MangadexManga {
    attributes:    MangaAttributes;
    id:            string;
    relationships: Relationship[];
    type:          string;
}

interface MangaAttributes {
    altTitles:        LanguageMap[];
    contentRating:    string;
    description:      LanguageMap;
    originalLanguage: string;
    status:           string;
    tags:             Tag[];
    title:            LanguageMap;
}

interface LanguageMap {
    en?: string;
	ja?: string;
}

interface Tag {
    attributes: TagAttributes;
}

interface TagAttributes {
    name: LanguageMap;
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
