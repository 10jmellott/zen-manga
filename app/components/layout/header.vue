<script lang="ts" setup>
const layoutStore = useLayoutStore()
const store = useMangaStore();
const route = useRoute();
const currentChapter = computed(() => {
	return store.currentManga?.chapters?.find(c => c.id === route.params.chapter);
});
</script>

<template>
    <div class="header glass fade-animation" :class="{ fade: layoutStore.showHeader }">
		<div class="chapter-header" v-if="currentChapter">
			<NuxtLink :to="`/${store.currentManga?.id}`" class="back-link">
				<Icon name="mdi:arrow-left" />
			</NuxtLink>
			<span class="chapter-number caption1">Ch. {{ currentChapter.chapter }}</span>
			<span class="chapter-title body1" :class="{ muted: !currentChapter.title }">{{ currentChapter.title ?? 'Untitled' }}</span>
		</div>
		<NuxtLink to="/" class="header__inner" v-else>
			<IconsLogo height="32" width="32" />
			<h1>Zen Manga</h1>
		</NuxtLink>
	</div>
</template>

<style scoped>
.header {
	background: var(--card-background);
	padding: var(--padding);
}
.header__inner {
	max-width: var(--content-width);
	margin: 0 auto;
	display: flex;
	align-items: center;
	gap: var(--spacing);
	justify-content: center;
}
h1 {
	font-size: 28px;
}
.back-link {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: var(--spacing);
	color: var(--primary);
	width: 32px;
	height: 32px;
	flex-shrink: 0;
}
.chapter-header {
	display: flex;
	flex-direction: row;
	gap: var(--spacing);
	align-items: center;
	white-space: nowrap;
}
.chapter-number {
	color: var(--primary);
	flex-shrink: 0;
}
.chapter-title {
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 100%;
}
</style>
