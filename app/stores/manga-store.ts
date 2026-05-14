import type { Manga, MangaChapter } from "~/types/manga";

export const useMangaStore = defineStore('manga', {
	state: () => ({
		currentManga: null as Manga | null,
		currentChapterImages: [] as string[],
		recentManga: [] as Manga[],
		favoriteManga: [] as Manga[],
		latestManga: [] as Manga[],
		popularManga: [] as Manga[],
		newestManga: [] as Manga[],
	}),
	getters: {
		currentChapterGroups: (state) => {
			if (!state.currentManga?.chapters) {
				return [];
			}

			// Group first by volume, then by chapter
			const volumeMap: Record<string, Record<string, MangaChapter[]>> = {};
			for (const chapter of state.currentManga.chapters) {
				const volumeKey = chapter.volume !== undefined ? `Volume ${chapter.volume}` : 'No Volume';
				const chapterKey = `Chapter ${chapter.chapter}`;

				if (!volumeMap[volumeKey]) {
					volumeMap[volumeKey] = {};
				}
				if (!volumeMap[volumeKey][chapterKey]) {
					volumeMap[volumeKey][chapterKey] = [];
				}
				volumeMap[volumeKey][chapterKey].push(chapter);
			}

			// Convert to array format
			return Object.entries(volumeMap).map(([volume, chapters]) => ({
				volume,
				chapters: Object.entries(chapters).map(([chapter, group]) => ({
					chapter,
					group
				}))
			}));
		},
		isWebComic: (state) => {
			if (!state.currentManga) {
				return false;
			}
			return state.currentManga.tags.includes('Web Comic')
			  || state.currentManga.tags.includes('Long Strip');
		},
		isFavoriteSeries: (state) => {
			return (useUserStore().favoriteSeries || []).includes(state.currentManga?.id || '');
		}
	},
	actions: {
		async fetchRecentManga() {
			try {
				const userStore = useUserStore();
				if (!userStore.recentSeries.length) {
					this.recentManga = [];
					return;
				}

				// Check if there are any new series in the list first to avoid unnecessary API calls
				const currentIds = new Set(this.recentManga.map(m => m.id));
				const newIds = userStore.recentSeries.filter(id => !currentIds.has(id));
				let recentManga: Manga[];
				if (newIds.length !== 0) {
					recentManga = await fetchMangaList(userStore.recentSeries);
				} else {
					// Sort the existing recent manga list according to the order in recentSeries
					const idToMangaMap = new Map(this.recentManga.map(m => [m.id, m]));
					recentManga = userStore.recentSeries.map(id => idToMangaMap.get(id)).filter(m => m !== undefined) as Manga[];
				}
				this.recentManga = recentManga;
			} catch (error) {
				console.error("Failed to fetch recent manga", error);
				this.recentManga = [];
			}
		},
		async fetchFavoriteManga() {
			try {
				const userStore = useUserStore();
				if (!userStore.favoriteSeries.length) {
					this.favoriteManga = [];
					return;
				}

				// Check if there are any new series in the list first to avoid unnecessary API calls
				const currentIds = new Set(this.favoriteManga.map(m => m.id));
				const newIds = userStore.favoriteSeries.filter(id => !currentIds.has(id));
				let favoriteManga: Manga[];
				if (newIds.length !== 0) {
					favoriteManga = await fetchMangaList(userStore.favoriteSeries);
				} else {
					// Sort the existing favorite manga list according to the order in favoriteSeries
					const idToMangaMap = new Map(this.favoriteManga.map(m => [m.id, m]));
					favoriteManga = userStore.favoriteSeries.map(id => idToMangaMap.get(id)).filter(m => m !== undefined) as Manga[];
				}
				this.favoriteManga = favoriteManga;
			} catch (error) {
				console.error("Failed to fetch favorite manga", error);
				this.favoriteManga = [];
			}
		},
		async fetchLatestManga() {
			try {
				const response = await fetchLatestManga();
				this.latestManga = response;
			} catch (error) {
				console.error("Failed to fetch latest manga", error);
			}
		},
		async fetchPopularManga() {
			try {
				const response = await fetchPopularManga();
				this.popularManga = response;
			} catch (error) {
				console.error("Failed to fetch popular manga", error);
			}
		},
		async fetchNewestManga() {
			try {
				const response = await fetchNewestManga();
				this.newestManga = response;
			} catch (error) {
				console.error("Failed to fetch newest manga", error);
			}
		},
		async fetchMangaById(id: string) {
			if (this.currentManga?.id === id) {
				return;
			}
			try {
				this.currentManga = null; // Clear current manga while loading new one
				const response = await fetchMangaById(id);
				this.currentManga = response;
			} catch (error) {
				console.error(`Failed to fetch manga with id ${id}`, error);
			}
		},
		async fetchChapterImagesById(id: string) {
			try {
				this.currentChapterImages = []; // Clear current images while loading new ones
				const response = await fetchChapterImagesById(id);
				this.currentChapterImages = response;
			} catch (error) {
				console.error(`Failed to fetch chapter images with id ${id}`, error);
			}
		}
	}
});
