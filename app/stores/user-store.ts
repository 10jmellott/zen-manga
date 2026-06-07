function chaptersStorageKey(series: string): string {
	return `read_${series}`;
}

function lastReadChapterStorageKey(series: string): string {
	return `last_read_${series}`;
}

const recentlyReadSeriesKey = "recently_read_series";
const favoriteSeriesKey = "favorite_series";

export interface LastReadChapter {
	id: string;
	chapter: number;
}

function getReadChapters(series: string): Set<string> {
	const chapters = new Set<string>();
	try {
		const storedValue = localStorage.getItem(chaptersStorageKey(series));
		if (storedValue) {
			return new Set(JSON.parse(storedValue) as string[]);
		}
	} catch (error) {
		console.error("Failed to get read chapters from localStorage", error);
	}
	return chapters;
}

function setReadChapter(series: string, chapterId: string) {
	try {
		const chapters = getReadChapters(series) || new Set<string>();
		chapters.add(chapterId);
		localStorage.setItem(chaptersStorageKey(series), JSON.stringify([...chapters]));
	} catch (error) {
		console.error("Failed to set read chapter to localStorage", error);
	}
}

function getLastReadChapter(series: string): LastReadChapter | null {
	try {
		const storedValue = localStorage.getItem(lastReadChapterStorageKey(series));
		if (storedValue) {
			return JSON.parse(storedValue) as LastReadChapter;
		}
	} catch (error) {
		console.error("Failed to get last read chapter from localStorage", error);
	}
	return null;
}

function setLastReadChapter(series: string, chapterId: string, chapter: number) {
	try {
		localStorage.setItem(lastReadChapterStorageKey(series), JSON.stringify({ id: chapterId, chapter } satisfies LastReadChapter));
	} catch (error) {
		console.error("Failed to set last read chapter to localStorage", error);
	}
}

function getRecentlyReadSeries(): string[] {
	try {
		const storedValue = localStorage.getItem(recentlyReadSeriesKey);
		if (storedValue) {
			return JSON.parse(storedValue) as string[];
		}
	} catch (error) {
		console.error("Failed to get recently read series from localStorage", error);
	}
	return [];
}

function addRecentlyReadSeries(series: string) {
	try {
		const recentSeries = getRecentlyReadSeries().filter(s => s !== series);
		recentSeries.unshift(series);
		if (recentSeries.length > 32) {
			recentSeries.pop();
		}
		localStorage.setItem(recentlyReadSeriesKey, JSON.stringify(recentSeries));
	} catch (error) {
		console.error("Failed to add recently read series to localStorage", error);
	}

	return getRecentlyReadSeries();
}

function getFavoriteSeries(): string[] {
	try {
		const storedValue = localStorage.getItem(favoriteSeriesKey);
		if (storedValue) {
			return JSON.parse(storedValue) as string[];
		}
	} catch (error) {
		console.error("Failed to get favorite series from localStorage", error);
	}
	return [];
}

function toggleFavoriteSeries(series: string) {
	try {
		let favoriteSeries = getFavoriteSeries();
		if (favoriteSeries.includes(series)) {
			favoriteSeries = favoriteSeries.filter(s => s !== series);
		} else {
			favoriteSeries.unshift(series);
		}
		localStorage.setItem(favoriteSeriesKey, JSON.stringify(favoriteSeries));
	} catch (error) {
		console.error("Failed to toggle favorite series in localStorage", error);
	}

	return getFavoriteSeries();
}

export const useUserStore = defineStore('user', {
	state: () => ({
		currentSeries: null as string | null,
		recentSeries: getRecentlyReadSeries(),
		favoriteSeries: getFavoriteSeries(),
	}),
	getters: {
		readChaptersForSeries: (state) => {
			return getReadChapters(state.currentSeries || "");
		},
		lastReadChapterForSeries: () => {
			return (series: string) => getLastReadChapter(series);
		},
	},
	actions: {
		async markAsRead(series: string, chapterId: string, chapterNumber?: number) {
			try {
				console.log(`Marking chapter ${chapterId} of series ${series} as read`);
				setReadChapter(series, chapterId);
				if (chapterNumber !== undefined) {
					setLastReadChapter(series, chapterId, chapterNumber);
				}
				this.recentSeries = addRecentlyReadSeries(series);
				// Force update
				const temp = this.currentSeries;
				this.currentSeries = null;
				this.currentSeries = temp;
			} catch (error) {
				console.error("Failed to mark chapter as read", error);
			}
		},
		async toggleFavorite(series: string) {
			try {
				this.favoriteSeries = toggleFavoriteSeries(series);
			} catch (error) {
				console.error("Failed to toggle favorite series in localStorage", error);
			}
		}
	}
});
