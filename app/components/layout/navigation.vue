<script lang="ts" setup>
const store = useMangaStore();
const route = useRoute();

function getChapterByOffset(offset: number) {
	if (!route.params.chapter || !store.currentManga?.chapters) return null;
	const chapterId = route.params.chapter as string;
	const chapter = store.currentManga.chapters.find(c => c.id === chapterId);
	if (!chapter) return null;
	const currentChapterNumber = chapter.chapter;
	const targetChapterNumber = currentChapterNumber + offset;
	const targetChapter = store.currentManga.chapters.filter(c => c.chapter === targetChapterNumber);
	if (targetChapter.length > 1) {
		// Try to match the current scanlation group if there are multiple chapters with the same chapter number
		const currentScanlationGroup = chapter.scanlationGroup;
		const matchingChapter = targetChapter.find(c => c.scanlationGroup === currentScanlationGroup);
		if (matchingChapter) {
			return matchingChapter;
		}
	}
	return targetChapter[0] ?? null;
}

const nextChapter = computed(() => getChapterByOffset(1));
</script>

<template>
    <div class="navigation glass">
		<NuxtLink v-if="nextChapter" :to="`/${store.currentManga?.id}/${nextChapter?.id}`" class="chapter-link">
			Chapter {{ nextChapter?.chapter ?? '-' }}
			<Icon name="mdi:arrow-right" />
		</NuxtLink>
	</div>
</template>

<style scoped>
.navigation {
	padding-bottom: 0;
    padding-bottom: env(safe-area-inset-bottom, 0);
}
.chapter-link {
	flex-grow: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--primary);
	gap: var(--padding);
	padding: var(--spacing);
}
</style>
