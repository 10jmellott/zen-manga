<script lang="ts" setup>
const userStore = useUserStore();
const store = useMangaStore();
store.fetchLatestManga();
store.fetchPopularManga();
store.fetchNewestManga();

onMounted(() => {
	store.fetchRecentManga();
	store.fetchFavoriteManga();
});

const continueReading = computed(() => {
	const seriesId = userStore.recentSeries[0];
	if (!seriesId) {
		return null;
	}
	const lastReadChapter = userStore.lastReadChapterForSeries(seriesId);
	if (!lastReadChapter) {
		return null;
	}
	return { seriesId, chapterId: lastReadChapter.id };
});
</script>

<template>
	<div class="home-page">
		<LayoutSearch />
		<NuxtLink v-if="continueReading" :to="`/${continueReading.seriesId}/${continueReading.chapterId}`" class="continue-reading">
			<Icon name="mdi:play-circle-outline" />
			<span>Continue Reading</span>
		</NuxtLink>
		<MangaScroll v-if="store.searchResults" title="Search Results" :items="store.searchResults" />
		<MangaScroll v-if="userStore.recentSeries.length" title="Recently Viewed" :items="store.recentManga" />
		<MangaScroll v-if="userStore.favoriteSeries.length" title="Favorite Manga" :items="store.favoriteManga" />
		<MangaScroll title="Latest Updates" :items="store.latestManga" />
		<MangaScroll title="Newest Manga" :items="store.newestManga" />
		<MangaScroll title="Popular Picks" :items="store.popularManga" />
	</div>
</template>

<style scoped>
.home-page {
	display: flex;
	flex-direction: column;
	gap: var(--spacing);
}

.continue-reading {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--padding);
	background-color: var(--primary);
	color: var(--foreground);
	font-weight: 700;
	border-radius: var(--border-radius);
	padding: var(--spacing);
}
</style>
