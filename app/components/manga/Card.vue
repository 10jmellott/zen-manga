<script lang="ts" setup>
import type { Manga } from '~/types/manga';
defineProps<{
	manga: Manga;
}>();
</script>

<template>
	<NuxtLink :to="`/${manga.id}`" class="manga-card">
		<img :src="manga.coverUrl" :alt="manga.title" class="cover" />
		<div class="info">
			<p class="body1">{{ manga.title }}</p>
			<MangaTags :manga />
		</div>
	</NuxtLink>
</template>

<style scoped>
.manga-card {
	display: flex;
	background-color: var(--card-background);
	border-radius: var(--border-radius);
	overflow: hidden;
}

img {
	height: 100%;
	object-fit: cover;
	max-width: 90px;
}

.info {
	flex-grow: 1;
	padding: var(--padding);
	display: flex;
	flex-direction: column;
	gap: var(--padding);
}

.body1 {
	/* Only allow 2 lines of title, then truncate with ellipsis */
	flex-shrink: 0;
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
