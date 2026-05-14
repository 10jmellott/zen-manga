<script lang="ts" setup>
const store = useMangaStore();
</script>

<template>
	<div class="search-page">
		<MangaCard class="item" v-for="manga in store.latestManga" :key="manga.id" :manga />
	</div>
</template>

<style scoped>
.search-page {
	display: flex;
	flex-direction: column;
	gap: var(--padding);
}
</style>
