<script lang="ts" setup>
import type { Manga } from '~/types/manga';
const props = defineProps<{
	manga: Manga;
}>();

const userStore = useUserStore();
const lastReadChapter = computed(() => userStore.lastReadChapterForSeries(props.manga.id));
</script>

<template>
	<NuxtLink :to="`/${manga.id}`" class="manga-card card">
		<img :src="manga.coverUrl" :alt="manga.title" class="cover" />
		<div class="info">
			<p class="body1">{{ manga.title }}</p>
			<p class="caption1 last-read" v-if="lastReadChapter">Last read: Ch. {{ lastReadChapter.chapter }}</p>
			<MangaTags :manga />
		</div>
	</NuxtLink>
</template>

<style scoped>
.manga-card {
	display: flex;
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

.last-read {
	color: var(--primary);
}
</style>
