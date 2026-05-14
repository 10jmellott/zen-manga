<script lang="ts" setup>
const layoutStore = useLayoutStore();
const store = useMangaStore();
const userStore = useUserStore();
const route = useRoute();
const series = route.params.series as string;
const chapter = route.params.chapter as string;
store.fetchMangaById(series);
store.fetchChapterImagesById(chapter).then(() => {
	userStore.markAsRead(series, chapter);
});
onMounted(() => {
	layoutStore.addContentPadding = false;
});
onUnmounted(() => {
	layoutStore.addContentPadding = true;
});
</script>

<template>
	<div class="chapter-page" :class="{ webcomic: store.isWebComic }">
		<CoreLoaderImage
			v-for="image in store.currentChapterImages"
			:key="image"
			:src="image"
		/>
		<div v-if="!store.currentChapterImages.length" class="muted caption1">No images found for this chapter.</div>
	</div>
</template>

<style scoped>
.chapter-page {
	display: flex;
	flex-direction: column;
	gap: 4px;

	&.webcomic {
		gap: 0;
	}
}
</style>
