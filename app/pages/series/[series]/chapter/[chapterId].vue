<script lang="ts" setup>
import type { Chapter, AtHomeServerResponse } from '~/types/mangadex';
import {
    getChapterById,
    getChapterPages,
    getMangaById,
    getCoverUrl,
    getMangaTitle,
    getChapterNumber,
} from '~/utils/api/mangadex';

const route = useRoute();
const mangaStore = useMangaStore();

const seriesId = computed(() => route.params.series as string);
const chapterId = computed(() => route.params.chapterId as string);

const manga = ref<Awaited<ReturnType<typeof getMangaById>>['data'] | null>(null);
const chapter = ref<Chapter | null>(null);
const pages = ref<string[]>([]);
const serverData = ref<AtHomeServerResponse | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const coverUrl = computed(() => manga.value ? getCoverUrl(manga.value.id, manga.value.relationships) : '');
const seriesTitle = computed(() => manga.value ? getMangaTitle(manga.value) : '');
const chapterTitle = computed(() => chapter.value ? getChapterNumber(chapter.value) : '');

const showControls = ref(true);

const allChapters = computed(() => mangaStore.currentChapters);
const currentChapterIndex = computed(() => {
    if (!chapter.value) return -1;
    return allChapters.value.findIndex((c) => c.id === chapter.value!.id);
});

const prevChapter = computed(() => {
    const idx = currentChapterIndex.value;
    return idx >= 0 && idx < allChapters.value.length - 1 ? allChapters.value[idx + 1] : null;
});

const nextChapter = computed(() => {
	const idx = currentChapterIndex.value;
    return idx > 0 ? allChapters.value[idx - 1] : null;
});

async function loadChapter() {
    loading.value = true;
    error.value = null;

    try {
        const [mangaResponse, chapterResponse] = await Promise.all([
            getMangaById(seriesId.value),
            getChapterById(chapterId.value),
        ]);

        manga.value = mangaResponse.data;
        chapter.value = chapterResponse.data;

        mangaStore.updateReadingProgress(
            seriesId.value,
            getMangaTitle(manga.value),
            coverUrl.value,
            chapterId.value,
            chapter.value.attributes.chapter || '0',
            chapter.value.attributes.title || ''
        );

        const serverResponse = await getChapterPages(chapterId.value);
        serverData.value = serverResponse;

        pages.value = serverResponse.chapter.dataSaver.map(
            (file) => `${serverResponse.baseUrl}/data-saver/${serverResponse.chapter.hash}/${file}`
        );
    } catch (err) {
        console.error('Failed to load chapter:', err);
        error.value = 'Failed to load chapter. Please try again.';
    } finally {
        loading.value = false;
    }
}

function toggleControls() {
    showControls.value = !showControls.value;
}

useHead(() => ({
    title: chapterTitle.value ? `${seriesTitle.value} - ${chapterTitle.value} - Zen Manga` : 'Loading... - Zen Manga',
}));

loadChapter();
setTimeout(toggleControls, 2000); // Auto-hide controls after 2 seconds
</script>

<template>
    <div class="reader">
        <div v-if="loading" class="reader__loading">
            <UiLoadingSpinner size="large" />
            <p>Loading chapter...</p>
        </div>

        <div v-else-if="error" class="reader__error">
            <Icon name="mdi:alert-circle-outline" size="64" />
            <p>{{ error }}</p>
            <NuxtLink :to="`/series/${seriesId}`" class="back-link">Back to series</NuxtLink>
        </div>

        <template v-else>
            <header v-if="showControls" class="reader__header">
                <NuxtLink :to="`/series/${seriesId}`" class="reader__back">
                    <Icon name="mdi:arrow-left" />
                </NuxtLink>
                <div class="reader__title-info">
                    <span class="reader__series-title">{{ seriesTitle }}</span>
                    <span class="reader__chapter-title">{{ chapterTitle }}</span>
                </div>
            </header>

            <main class="reader__content">
                <div
                    v-for="(page, index) in pages"
                    :key="index"
                    :data-page="index"
                    class="reader__page"
                    @click="toggleControls"
                >
                    <img :src="page" :alt="`Page ${index + 1}`" loading="lazy" />
                </div>
            </main>

            <footer v-if="showControls" class="reader__footer">
                <NuxtLink
                    v-if="prevChapter"
                    :to="`/series/${seriesId}/chapter/${prevChapter.id}`"
					@click="toggleControls"
                    class="reader__nav reader__nav--prev"
                >
                    <Icon name="mdi:chevron-left" />
                    <span>Prev</span>
                </NuxtLink>
				<span v-else></span>

                <NuxtLink
                    v-if="nextChapter"
                    :to="`/series/${seriesId}/chapter/${nextChapter.id}`"
					@click="toggleControls"
                    class="reader__nav reader__nav--next"
                >
                    <span>Next</span>
                    <Icon name="mdi:chevron-right" />
                </NuxtLink>
				<span v-else></span>
            </footer>
        </template>
    </div>
</template>

<style scoped>
.reader {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--reader-background);
}

.reader__loading,
.reader__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing);
    height: 100vh;
    color: var(--reader-text);
    text-align: center;
}

.back-link {
    color: var(--primary);
    font-weight: 500;
}

.reader__header {
    display: flex;
    align-items: center;
    gap: var(--spacing);
    padding: var(--spacing);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    transform: translateY(0);
    transition: transform 0.3s ease-in-out;
}

.reader__header--hidden {
    transform: translateY(-100%);
}

.reader__back {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--secondary);
    color: var(--foreground);
    transition: background-color var(--default-animation);
}

.reader__back:hover {
    background-color: var(--primary);
}

.reader__title-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.reader__series-title {
    font-size: 0.875rem;
    color: var(--foreground-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.reader__chapter-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--foreground);
}

.reader__content {
    flex: 1;
    display: block;
}

.reader__page {
    background-color: var(--secondary);
}

.reader__page img {
    width: 100%;
    height: auto;
    display: block;
}

.reader__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    transform: translateY(0);
    transition: transform 0.3s ease-in-out;
}

.reader__footer--hidden {
    transform: translateY(100%);
}

.reader__nav {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 16px;
    border-radius: var(--border-radius);
    background-color: var(--secondary);
    color: var(--foreground);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: background-color var(--default-animation);
}

.reader__nav:hover:not(.reader__nav--disabled) {
    background-color: var(--primary);
}

.reader__nav--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reader__page-info {
    display: flex;
    align-items: center;
    gap: var(--inner-gap);
}

.reader__page-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--secondary);
    color: var(--foreground);
    cursor: pointer;
    border: none;
    transition: background-color var(--default-animation);
}

.reader__page-btn:hover:not(:disabled) {
    background-color: var(--primary);
}

.reader__page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reader__page-number {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--foreground);
    min-width: 60px;
    text-align: center;
}
</style>
