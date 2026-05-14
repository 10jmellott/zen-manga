<script lang="ts" setup>
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
		<h3 class="h3">Recently Viewed</h3>
		<MangaScroll :items="store.recentManga" />
		<h3 class="h3">Favorite Manga</h3>
		<MangaScroll :items="store.favoriteManga" />
		<h3 class="h3">Latest Updates</h3>
		<MangaScroll :items="store.latestManga" />
		<h3 class="h3">Newest Manga</h3>
		<MangaScroll :items="store.newestManga" />
		<h3 class="h3">Popular Picks</h3>
		<MangaScroll :items="store.popularManga" />
	</div>
</template>

<style scoped>
.home-page {
	display: flex;
	flex-direction: column;
	gap: var(--spacing);
}
</style>
