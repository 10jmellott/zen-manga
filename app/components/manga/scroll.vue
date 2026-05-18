<script lang="ts" setup>
import type { Manga } from '~/types/manga';
defineProps<{
	title: string;
	items: Manga[];
}>();
</script>

<template>
	<div class="manga-scroll">
		<h3 class="h3">{{ title }}</h3>
		<div class="manga-scroll__content hide-scrollbar">
			<CoreLoader v-if="!items.length" />
			<MangaCard v-else class="item" v-for="manga in items" :key="manga.id" :manga />
		</div>
	</div>
</template>

<style scoped>
.manga-scroll {
	display: flex;
	flex-direction: column;
	gap: var(--padding);
}

.manga-scroll__content {
	display: flex;
	gap: var(--padding);
	overflow-x: auto;
	border-radius: var(--border-radius);

	/* Tablet and above disable scroll & wrap */
	@media (min-width: 768px) {
		flex-wrap: wrap;
		overflow-x: hidden;
	}
}

.item {
	flex-shrink: 0;
	width: 300px;
	height: 140px;
}
</style>
