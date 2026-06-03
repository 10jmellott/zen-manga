<script lang="ts" setup>
import type { Manga } from '~/types/manga';
defineProps<{
	manga: Manga;
}>();
</script>

<template>
	<div class="tags">
		<MangaTag :tag="manga.status" v-if="manga.status !== 'ongoing'"/>
		<MangaTag :tag="manga.contentRating" v-if="manga.contentRating !== 'safe'" />
		<MangaTag v-for="tag in manga.tags" :key="tag" :tag />
	</div>
</template>

<style scoped>
.tags {
	display: flex;
	gap: 4px;
	flex-wrap: wrap;
	overflow: hidden;
}
</style>
