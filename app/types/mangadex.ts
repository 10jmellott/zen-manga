export interface MangaAttributes {
    title: Record<string, string>;
    altTitles: Array<Record<string, string>>;
    description: Record<string, string>;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled' | 'unknown';
    year: number | null;
    contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
    tags: Tag[];
    originalLanguage: string;
    lastChapter: string | null;
    lastVolume: string | null;
    demographic: string | null;
    createdAt: string;
    updatedAt: string;
    availableTranslatedLanguages: string[];
    state: 'published' | 'draft' | 'rejected' | 'submitted';
}

export interface ChapterAttributes {
    volume: string | null;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: string | null;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    localeOptions?: Record<string, string>;
}

export interface CoverAttributes {
    description: string;
    volume: string | null;
    fileName: string;
    locale: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthorAttributes {
    name: string;
    imageUrl: string | null;
    biography: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface TagAttributes {
    name: Record<string, string>;
    description: Record<string, string>;
    group: 'genre' | 'theme' | 'format' | 'content';
}

export interface Relationship {
    id: string;
    type: 'manga' | 'chapter' | 'cover_art' | 'author' | 'artist' | 'tag' | 'scanlation_group' | 'custom_list';
    attributes?: MangaAttributes | ChapterAttributes | CoverAttributes | AuthorAttributes | TagAttributes;
}

export interface Manga {
    id: string;
    type: 'manga';
    attributes: MangaAttributes;
    relationships: Relationship[];
}

export interface Chapter {
    id: string;
    type: 'chapter';
    attributes: ChapterAttributes;
    relationships: Relationship[];
}

export interface Cover {
    id: string;
    type: 'cover_art';
    attributes: CoverAttributes;
    relationships: Relationship[];
}

export interface Author {
    id: string;
    type: 'author';
    attributes: AuthorAttributes;
    relationships: Relationship[];
}

export interface Tag {
    id: string;
    type: 'tag';
    attributes: TagAttributes;
    relationships: Relationship[];
}

export interface AtHomeServerResponse {
    result: string;
    baseUrl: string;
    chapter: {
        hash: string;
        dataSaver: string[];
        data: string[];
    };
}

export interface MangaResponse {
    result: string;
    response: string;
    data: Manga;
    relationships: Relationship[];
}

export interface MangaListResponse {
    result: string;
    response: string;
    data: Manga[];
    relationships: Relationship[];
    limit: number;
    offset: number;
    total: number;
}

export interface ChapterResponse {
    result: string;
    response: string;
    data: Chapter;
    relationships: Relationship[];
}

export interface ChapterListResponse {
    result: string;
    response: string;
    data: Chapter[];
    relationships: Relationship[];
    limit: number;
    offset: number;
    total: number;
}

export interface CoverListResponse {
    result: string;
    response: string;
    data: Cover[];
    relationships: Relationship[];
    limit: number;
    offset: number;
    total: number;
}

export interface TagListResponse {
    result: string;
    response: string;
    data: Tag[];
    limit: number;
    offset: number;
    total: number;
}

export interface FeedParams {
    translatedLanguage?: string[];
    translatedLanguageQuery?: string;
    limit?: number;
    offset?: number;
    includes?: string[];
    order?: {
        volume?: 'asc' | 'desc';
        chapter?: 'asc' | 'desc';
        publishAt?: 'asc' | 'desc';
        createdAt?: 'asc' | 'desc';
    };
}

export interface MangaParams {
    title?: string;
    authors?: string[];
    artists?: string[];
    year?: number;
    includedTags?: string[];
    excludedTags?: string[];
    status?: string[];
    originalLanguage?: string[];
    contentRating?: string[];
    demographics?: string[];
    limit?: number;
    offset?: number;
    includes?: string[];
    order?: {
        latestUploadedChapter?: 'asc' | 'desc';
        title?: 'asc' | 'desc';
        createdAt?: 'asc' | 'desc';
        followedCount?: 'asc' | 'desc';
        relevance?: 'asc' | 'desc';
    };
}

export interface ReadingState {
    seriesId: string;
    seriesTitle: string;
    coverUrl: string;
    chapterId: string;
    chapterNumber: string;
    chapterTitle: string;
    timestamp: number;
}

export interface FavoriteState {
    id: string;
    title: string;
    coverUrl: string;
    addedAt: number;
}
