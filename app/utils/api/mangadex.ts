import type {
    Manga,
    Chapter,
    Cover,
    Tag,
    Author,
    AtHomeServerResponse,
    MangaResponse,
    MangaListResponse,
    ChapterListResponse,
    ChapterResponse,
    CoverListResponse,
    TagListResponse,
    MangaParams,
    FeedParams,
    Relationship,
    CoverAttributes,
} from '~/types/mangadex';

const BASE_URL = 'https://api.mangadex.org';
const CORS_PROXY = 'https://corsproxy.10jmellott.workers.dev/?url=';

function proxyUrl(url: string): string {
    return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

function getImageUrl(mangaId: string, cover: CoverAttributes | undefined, size: '256' | '512' | 'original' = '256'): string {
    if (!cover?.fileName) {
        return `https://via.placeholder.com/${size === '256' ? '256x384' : '512x768'}/1a1a1a/666666?text=No+Cover`;
    }
    return proxyUrl(`https://uploads.mangadex.org/covers/${mangaId}/${cover.fileName}.${size}.jpg`);
}

function getRelationship<T extends { id: string; type: string; attributes?: Record<string, unknown> }>(
    relationships: Relationship[],
    type: string
): T | undefined {
    return relationships.find((r) => r.type === type) as T | undefined;
}

function getCoverArt(mangaId: string, relationships: Relationship[]): string {
    const cover = getRelationship<Cover>(relationships, 'cover_art');
    return getImageUrl(mangaId, cover?.attributes);
}

function getEnglishTitle(titles: Record<string, string> | Record<string, string>[], fallback = 'Unknown Title'): string {
    if (typeof titles === 'object' && !Array.isArray(titles)) {
        return titles.en || Object.values(titles)[0] || fallback;
    }
    if (Array.isArray(titles)) {
        const english = titles.find((t) => t.en);
        return english?.en || Object.values(titles[0] || {})[0] || fallback;
    }
    return fallback;
}

async function fetchWithTimeout<T>(url: string, options: RequestInit = {}, timeout = 10000): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(proxyUrl(url), {
            ...options,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function getTrendingManga(limit = 10): Promise<Manga[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    params.set('order[followedCount]', 'desc');
    params.append('contentRating[]', 'safe,suggestive');

    const data = await fetchWithTimeout<MangaListResponse>(
        `${BASE_URL}/manga?${params.toString()}`
    );
    return data.data;
}

export async function getLatestManga(limit = 20): Promise<Manga[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    params.set('order[latestUploadedChapter]', 'desc');
    params.append('contentRating[]', 'safe,suggestive');

    const data = await fetchWithTimeout<MangaListResponse>(
        `${BASE_URL}/manga?${params.toString()}`
    );
    return data.data;
}

export async function getPopularManga(limit = 20): Promise<Manga[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');
    params.set('order[relevance]', 'desc');
    params.append('contentRating[]', 'safe,suggestive');

    const data = await fetchWithTimeout<MangaListResponse>(
        `${BASE_URL}/manga?${params.toString()}`
    );
    return data.data;
}

export async function getMangaById(id: string): Promise<MangaResponse> {
    const params = new URLSearchParams();
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');

    return fetchWithTimeout<MangaResponse>(
        `${BASE_URL}/manga/${id}?${params.toString()}`
    );
}

export async function getMangaChapters(
    mangaId: string,
    params: FeedParams = {}
): Promise<ChapterListResponse> {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', String(params.offset));
    if (params.translatedLanguage) {
        params.translatedLanguage.forEach((lang) => {
            queryParams.append('translatedLanguage[]', lang);
        });
    }
    if (params.order?.chapter) queryParams.set('order[chapter]', params.order.chapter);
    if (params.order?.publishAt) queryParams.set('order[publishAt]', params.order.publishAt);
    queryParams.set('includes[]', 'scanlation_group');

    return fetchWithTimeout<ChapterListResponse>(
        `${BASE_URL}/manga/${mangaId}/feed?${queryParams.toString()}`
    );
}

export async function getChapterById(chapterId: string): Promise<ChapterResponse> {
    return fetchWithTimeout<ChapterResponse>(`${BASE_URL}/chapter/${chapterId}`);
}

export async function getChapterPages(chapterId: string): Promise<AtHomeServerResponse> {
    return fetchWithTimeout<AtHomeServerResponse>(`${BASE_URL}/at-home/server/${chapterId}`);
}

export async function searchManga(params: MangaParams): Promise<MangaListResponse> {
    const queryParams = new URLSearchParams();

    if (params.title) queryParams.set('title', params.title);
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', String(params.offset));
    if (params.status) {
        params.status.forEach((s) => queryParams.append('status[]', s));
    }
    if (params.contentRating) {
        params.contentRating.forEach((c) => queryParams.append('contentRating[]', c));
    }
    if (params.includedTags) {
        params.includedTags.forEach((t) => queryParams.append('includedTags[]', t));
    }
    if (params.excludedTags) {
        params.excludedTags.forEach((t) => queryParams.append('excludedTags[]', t));
    }
    if (params.order) {
        if (params.order.latestUploadedChapter) {
            queryParams.set('order[latestUploadedChapter]', params.order.latestUploadedChapter);
        }
        if (params.order.title) {
            queryParams.set('order[title]', params.order.title);
        }
        if (params.order.createdAt) {
            queryParams.set('order[createdAt]', params.order.createdAt);
        }
        if (params.order.followedCount) {
            queryParams.set('order[followedCount]', params.order.followedCount);
        }
        if (params.order.relevance) {
            queryParams.set('order[relevance]', params.order.relevance);
        }
    }
    queryParams.append('includes[]', 'cover_art');

    return fetchWithTimeout<MangaListResponse>(
        `${BASE_URL}/manga?${queryParams.toString()}`
    );
}

export async function getTags(): Promise<TagListResponse> {
    return fetchWithTimeout<TagListResponse>(`${BASE_URL}/manga/tag`);
}

export async function getCoversByMangaId(mangaId: string): Promise<CoverListResponse> {
    const params = new URLSearchParams();
    params.append('manga[]', mangaId);
    params.set('limit', '10');

    return fetchWithTimeout<CoverListResponse>(
        `${BASE_URL}/cover?${params.toString()}`
    );
}

export async function getAuthorById(authorId: string): Promise<{ result: string; data: Author }> {
    return fetchWithTimeout<{ result: string; data: Author }>(
        `${BASE_URL}/author/${authorId}`
    );
}

export async function getMangaByAuthor(authorId: string): Promise<MangaListResponse> {
    const params = new URLSearchParams();
    params.set('authors', authorId);
    params.append('includes[]', 'cover_art');
    params.set('limit', '10');

    return fetchWithTimeout<MangaListResponse>(
        `${BASE_URL}/manga?${params.toString()}`
    );
}

export function getCoverUrl(mangaId: string, relationships: Relationship[], size: '256' | '512' = '256'): string {
    return getCoverArt(mangaId, relationships);
}

export function getMangaTitle(manga: Manga): string {
    return getEnglishTitle(manga.attributes.title);
}

export function getMangaDescription(manga: Manga): string {
    return getEnglishTitle([manga.attributes.description]) || 'No description available.';
}

export function getChapterNumber(chapter: Chapter): string {
    if (!chapter.attributes.chapter) return 'One-shot';
    return `Ch. ${chapter.attributes.chapter}`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

export function getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        ongoing: 'Ongoing',
        completed: 'Completed',
        hiatus: 'Hiatus',
        cancelled: 'Cancelled',
        unknown: 'Unknown',
    };
    return statusMap[status] || status;
}

export { getImageUrl, getCoverArt, getEnglishTitle, getRelationship };
