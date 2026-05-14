export interface Manga {
	title: string;
	description: string;
	coverUrl: string;
	originalLanguage: string;
	status: string;
	contentRating: string;
	tags: string[];
	id: string;
	chapters?: MangaChapter[];
}

export interface MangaChapter {
	volume?: number;
	chapter: number;
	title?: string;
	id: string;
	scanlationGroup?: string;
	externalUrl?: string;
}
