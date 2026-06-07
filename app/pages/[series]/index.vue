<script lang="ts" setup>
const store = useMangaStore();
const userStore = useUserStore();
const route = useRoute();
const series = route.params.series as string;
store.fetchMangaById(series).then(() => {
	userStore.currentSeries = series;
});
const clamped = ref(true);

const lastReadChapter = computed(() => userStore.lastReadChapterForSeries(series));

function parseMarkdown(text: string) {
	return text
		.replace(/\n\n/g, '<br>')
		.replace(/---/g, '<hr>') // Horizontal rule
		.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>') // Links
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
		.replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
		.replace(/~~(.+?)~~/g, '<del>$1</del>') // Strikethrough
		.replace(/`(.+?)`/g, '<code>$1</code>'); // Inline code
}
</script>

<template>
	<div class="series-page">
		<div class="series-meta" v-if="store.currentManga">
			<h1 class="h3">{{ store.currentManga?.title }}</h1>
			<img :src="store.currentManga?.coverUrl" :alt="store.currentManga?.title" class="cover" />
			<MangaTags :manga="store.currentManga" />
			<p class="muted" :class="{ clamped }" @click="clamped = !clamped" v-html="parseMarkdown(store.currentManga?.description)"></p>
			<div class="actions">
				<button @click="userStore.toggleFavorite(store.currentManga?.id)" :class="{ favorite: store.isFavoriteSeries }">
					<Icon :name="store.isFavoriteSeries ? 'fe:heart' : 'fe:heart-o'" />
					<span>{{ store.isFavoriteSeries ? 'Unfavorite' : 'Favorite' }}</span>
				</button>
				<NuxtLink v-if="lastReadChapter" :to="`/${series}/${lastReadChapter.id}`" class="action-link continue">
					<Icon name="mdi:play-circle-outline" />
					<span>Continue Reading (Ch. {{ lastReadChapter.chapter }})</span>
				</NuxtLink>
			</div>
		</div>
		<CoreLoader v-else />
		<div v-if="store.currentManga?.chapters?.length">
			<h2 class="section-header">
				<Icon name="mdi:format-list-numbered" />
				Chapters ({{ store.currentManga.chapters.length }})
			</h2>
			<div class="chapters">
				<div class="volume" v-for="volume in store.currentChapterGroups">
					<span class="caption1">{{ volume.volume }}</span>
					<div class="chapter-collection" :class="{ collection: chapterCollection.group.length > 1}" v-for="chapterCollection in volume.chapters">
						<NuxtLink v-for="chapter in chapterCollection.group" :key="chapter.id" :to="chapter?.externalUrl ?? `/${store.currentManga.id}/${chapter.id}`" class="chapter-link" :class="{ muted: userStore.readChaptersForSeries.has(chapter.id) }">
							<span class="chapter-number caption1">Ch. {{ chapter.chapter }}</span>
							<Icon name="mdi:external-link" v-if="chapter.externalUrl" />
							<span class="chapter-title body1" :class="{ muted: !chapter.title }">{{ chapter.title ?? 'Untitled' }}</span>
							<span class="scanlation-group caption2 muted">{{ chapter.scanlationGroup }}</span>
							<Icon class="viewed" v-if="userStore.readChaptersForSeries.has(chapter.id)" name="fe:eye" />
						</NuxtLink>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.series-page {
	display: flex;
	flex-direction: column;
	gap: var(--spacing);
}
img {
	width: 200px;
	max-height: 300px;
	object-fit: cover;
	border-radius: var(--border-radius);
	align-self: center;
}
.series-meta {
	background-color: var(--card-background);
	border-radius: var(--border-radius);
	padding: var(--spacing);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing);
}
.h3 {
	text-align: center;
}
.clamped {
	display: -webkit-box;
	line-clamp: 6;
	-webkit-line-clamp: 6;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.section-header {
	display: flex;
	align-items: center;
	gap: var(--padding);
	font-size: 1.5em;
	margin-bottom: var(--spacing);
}
.chapters {
	display: flex;
	flex-direction: column;
	gap: var(--padding);
}
.chapter-collection,
.volume {
	display: flex;
	flex-direction: column;
	gap: var(--padding);
}
.chapter-collection.collection {
	padding-left: var(--spacing);
	border-left: 4px solid var(--primary);
	gap: 4px;
	margin: 4px 0; /* Some extra spacing */
}
.chapter-link {
	display: flex;
	flex-direction: row;
	gap: var(--spacing);
	align-items: center;
	background-color: var(--card-background);
	border-radius: var(--border-radius);
	padding: var(--spacing);
	white-space: nowrap;
}
.chapter-number {
	color: var(--primary);
	flex-shrink: 0;
}
.chapter-title {
	text-overflow: ellipsis;
	overflow: hidden;
}
.scanlation-group {
	flex-shrink: 2;
	text-overflow: ellipsis;
	overflow: hidden;
}
.viewed {
	flex-shrink: 0;
	margin-left: auto;
}
.actions {
	display: flex;
	flex-wrap: wrap;
	gap: var(--padding);
	justify-content: center;
}
button,
.action-link {
	align-self: normal;
	display: flex;
	gap: var(--padding);
	align-items: center;
	justify-content: center;
	border: var(--primary) 1px solid;
	border-radius: var(--border-radius);
	color: var(--primary);
	padding: var(--padding) var(--spacing);

	&.favorite,
	&.continue {
		background-color: var(--primary);
		color: var(--foreground);
	}
}
</style>
