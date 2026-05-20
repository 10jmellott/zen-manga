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
</script>

<template>
	<div class="home-page">
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
</style>
