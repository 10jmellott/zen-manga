import { defineStore } from 'pinia';
import type { ReadingState, FavoriteState, Manga, Chapter } from '~/types/mangadex';
import { getMangaTitle, getCoverUrl, getChapterNumber } from '~/utils/api/mangadex';

const STORAGE_KEY = 'zen-manga-state';

interface CachedManga {
    id: string;
    title: string;
    coverUrl: string;
    description?: string;
    cachedAt: number;
}

interface MangaState {
    continueReading: ReadingState[];
    favorites: FavoriteState[];
    trending: Manga[];
    latestManga: Manga[];
    popularManga: Manga[];
    featuredManga: Manga[];
    cachedManga: Record<string, CachedManga>;
    currentSeries: Manga | null;
    currentChapters: Chapter[];
    lastUpdated: Array<{ id: string; title: string }>;
}

function loadStateFromStorage(): Partial<MangaState> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load state from storage:', e);
    }
    return {};
}

function saveStateToStorage(state: MangaState): void {
    if (typeof window === 'undefined') return;
    try {
        const toStore = {
            continueReading: state.continueReading,
            favorites: state.favorites,
            cachedManga: state.cachedManga,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
        console.error('Failed to save state to storage:', e);
    }
}

export const useMangaStore = defineStore('manga', {
    state: (): MangaState => {
        const stored = loadStateFromStorage();
        return {
            continueReading: stored.continueReading || [],
            favorites: stored.favorites || [],
            trending: [],
            latestManga: [],
            popularManga: [],
            featuredManga: [],
            cachedManga: stored.cachedManga || {},
            currentSeries: null,
            currentChapters: [],
            lastUpdated: stored.continueReading?.map((r: ReadingState) => ({ id: r.seriesId, title: r.seriesTitle })) || [],
        };
    },

    getters: {
        isFavorite: (state) => (mangaId: string): boolean => {
            return state.favorites.some((f) => f.id === mangaId);
        },

        getContinueReading: (state) => (mangaId: string): ReadingState | undefined => {
            return state.continueReading.find((r) => r.seriesId === mangaId);
        },

        hasContinueReading: (state): boolean => {
            return state.continueReading.length > 0;
        },

        favoriteCount: (state): number => {
            return state.favorites.length;
        },
    },

    actions: {
        updateReadingProgress(
            seriesId: string,
            seriesTitle: string,
            coverUrl: string,
            chapterId: string,
            chapterNumber: string,
            chapterTitle: string
        ): void {
            const existingIndex = this.continueReading.findIndex((r) => r.seriesId === seriesId);
            const readingState: ReadingState = {
                seriesId,
                seriesTitle,
                coverUrl,
                chapterId,
                chapterNumber,
                chapterTitle,
                timestamp: Date.now(),
            };

            if (existingIndex >= 0) {
                this.continueReading[existingIndex] = readingState;
            } else {
                this.continueReading.unshift(readingState);
            }

            this.continueReading = this.continueReading
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 20);

            this.lastUpdated = this.continueReading.map((r) => ({
                id: r.seriesId,
                title: r.seriesTitle,
            }));

            this.persistState();
        },

        toggleFavorite(manga: Manga): void {
            const coverUrl = getCoverUrl(manga.id, manga.relationships);
            const title = getMangaTitle(manga);
            const existingIndex = this.favorites.findIndex((f) => f.id === manga.id);

            if (existingIndex >= 0) {
                this.favorites.splice(existingIndex, 1);
            } else {
                this.favorites.push({
                    id: manga.id,
                    title,
                    coverUrl,
                    addedAt: Date.now(),
                });
            }
            this.persistState();
        },

        cacheManga(manga: Manga): void {
            const title = getMangaTitle(manga);
            const coverUrl = getCoverUrl(manga.id, manga.relationships);
            const description = manga.attributes.description?.en || '';

            this.cachedManga[manga.id] = {
                id: manga.id,
                title,
                coverUrl,
                description,
                cachedAt: Date.now(),
            };

            if (this.trending.length > 0 && !this.trending.find((m) => m.id === manga.id)) {
                this.trending.unshift(manga);
            }
            if (this.latestManga.length > 0 && !this.latestManga.find((m) => m.id === manga.id)) {
                this.latestManga.unshift(manga);
            }
            if (this.popularManga.length > 0 && !this.popularManga.find((m) => m.id === manga.id)) {
                this.popularManga.unshift(manga);
            }

            this.persistState();
        },

        setTrending(manga: Manga[]): void {
            this.trending = manga;
            this.featuredManga = manga.slice(0, 5);
        },

        setLatestManga(manga: Manga[]): void {
            this.latestManga = manga;
        },

        setPopularManga(manga: Manga[]): void {
            this.popularManga = manga;
        },

        setCurrentSeries(manga: Manga | null): void {
            this.currentSeries = manga;
            if (manga) {
                this.cacheManga(manga);
            }
        },

        setCurrentChapters(chapters: Chapter[]): void {
            this.currentChapters = chapters;
        },

        persistState(): void {
            saveStateToStorage({
                continueReading: this.continueReading,
                favorites: this.favorites,
                cachedManga: this.cachedManga,
                trending: this.trending,
                latestManga: this.latestManga,
                popularManga: this.popularManga,
                featuredManga: this.featuredManga,
                currentSeries: this.currentSeries,
                currentChapters: this.currentChapters,
                lastUpdated: this.lastUpdated,
            });
        },

        clearReadingHistory(): void {
            this.continueReading = [];
            this.lastUpdated = [];
            this.persistState();
        },

        removeFromContinueReading(seriesId: string): void {
            this.continueReading = this.continueReading.filter((r) => r.seriesId !== seriesId);
            this.lastUpdated = this.lastUpdated.filter((u) => u.id !== seriesId);
            this.persistState();
        },
    },
});
