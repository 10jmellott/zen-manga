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
const chapterSubtitle = computed(() => chapter.value?.attributes.title || '');

const currentPage = ref(0);
const showControls = ref(true);
const readingMode = ref<'single' | 'scroll'>('single');

const allChapters = computed(() => mangaStore.currentChapters);
const currentChapterIndex = computed(() => {
    if (!chapter.value) return -1;
    return allChapters.value.findIndex((c) => c.id === chapter.value!.id);
});

const prevChapter = computed(() => {
    const idx = currentChapterIndex.value;
    return idx > 0 ? allChapters.value[idx - 1] : null;
});

const nextChapter = computed(() => {
    const idx = currentChapterIndex.value;
    return idx >= 0 && idx < allChapters.value.length - 1 ? allChapters.value[idx + 1] : null;
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
            (file) => `https://corsproxy.10jmellott.workers.dev/?url=${encodeURIComponent(`${serverResponse.baseUrl}/data-saver/${serverResponse.chapter.hash}/${file}`)}`
        );
    } catch (err) {
        console.error('Failed to load chapter:', err);
        error.value = 'Failed to load chapter. Please try again.';
    } finally {
        loading.value = false;
    }
}

function goToPage(index: number) {
    if (index >= 0 && index < pages.value.length) {
        currentPage.value = index;
        scrollToPage(index);
    }
}

function scrollToPage(index: number) {
    const pageEl = document.querySelector(`[data-page="${index}"]`);
    if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function goToPrevPage() {
    goToPage(currentPage.value - 1);
}

function goToNextPage() {
    goToPage(currentPage.value + 1);
}

function toggleControls() {
    showControls.value = !showControls.value;
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
        goToPrevPage();
    } else if (e.key === 'ArrowRight') {
        goToNextPage();
    } else if (e.key === ' ') {
        e.preventDefault();
        toggleControls();
    }
}

watch(currentPage, () => {
    if (readingMode.value === 'single') {
        document.documentElement.style.setProperty('--page-progress', `${((currentPage.value + 1) / pages.value.length) * 100}%`);
    }
});

onMounted(() => {
    loadChapter();
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

useHead(() => ({
    title: chapterTitle.value ? `${seriesTitle.value} - ${chapterTitle.value} - Zen Manga` : 'Loading... - Zen Manga',
}));
</script>

<template>
    <div class="reader" :class="{ 'reader--hide-controls': !showControls }">
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
            <header class="reader__header">
                <NuxtLink :to="`/series/${seriesId}`" class="reader__back">
                    <Icon name="mdi:arrow-left" />
                </NuxtLink>
                <div class="reader__title-info">
                    <span class="reader__series-title">{{ seriesTitle }}</span>
                    <span class="reader__chapter-title">{{ chapterTitle }}</span>
                </div>
                <div class="reader__header-actions">
                    <button class="reader__btn" @click="showControls = !showControls" title="Toggle controls">
                        <Icon name="mdi:cog" />
                    </button>
                </div>
            </header>

            <main class="reader__content" :class="`reader__content--${readingMode}`">
                <div
                    v-for="(page, index) in pages"
                    :key="index"
                    :data-page="index"
                    class="reader__page"
                    @click="readingMode === 'single' ? goToNextPage() : null"
                >
                    <img :src="page" :alt="`Page ${index + 1}`" loading="lazy" />
                </div>
            </main>

            <footer class="reader__footer">
                <NuxtLink
                    v-if="prevChapter"
                    :to="`/series/${seriesId}/chapter/${prevChapter.id}`"
                    class="reader__nav reader__nav--prev"
                >
                    <Icon name="mdi:chevron-left" />
                    <span>Prev</span>
                </NuxtLink>
                <div v-else class="reader__nav reader__nav--disabled">
                    <Icon name="mdi:chevron-left" />
                    <span>First</span>
                </div>

                <div class="reader__page-info">
                    <button class="reader__page-btn" @click="goToPrevPage" :disabled="currentPage === 0">
                        <Icon name="mdi:chevron-up" />
                    </button>
                    <span class="reader__page-number">{{ currentPage + 1 }} / {{ pages.length }}</span>
                    <button class="reader__page-btn" @click="goToNextPage" :disabled="currentPage === pages.length - 1">
                        <Icon name="mdi:chevron-down" />
                    </button>
                </div>

                <NuxtLink
                    v-if="nextChapter"
                    :to="`/series/${seriesId}/chapter/${nextChapter.id}`"
                    class="reader__nav reader__nav--next"
                >
                    <span>Next</span>
                    <Icon name="mdi:chevron-right" />
                </NuxtLink>
                <div v-else class="reader__nav reader__nav--disabled">
                    <span>Latest</span>
                    <Icon name="mdi:chevron-right" />
                </div>
            </footer>

            <div class="reader__controls" v-if="showControls">
                <div class="reader__controls-group">
                    <label>Reading Mode</label>
                    <div class="reader__controls-options">
                        <button
                            :class="{ active: readingMode === 'single' }"
                            @click="readingMode = 'single'"
                        >
                            Single
                        </button>
                        <button
                            :class="{ active: readingMode === 'scroll' }"
                            @click="readingMode = 'scroll'"
                        >
                            Scroll
                        </button>
                    </div>
                </div>
            </div>
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
    background-color: rgba(0, 0, 0, 0.8);
    position: sticky;
    top: 0;
    z-index: 50;
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

.reader__header-actions {
    display: flex;
    gap: var(--inner-gap);
}

.reader__btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: transparent;
    color: var(--foreground);
    cursor: pointer;
    border: none;
    transition: background-color var(--default-animation);
}

.reader__btn:hover {
    background-color: var(--secondary);
}

.reader__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
}

.reader__content--single .reader__page {
    width: 100%;
    max-width: 900px;
    cursor: pointer;
}

.reader__content--scroll {
    display: block;
}

.reader__content--scroll .reader__page {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
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
    background-color: rgba(0, 0, 0, 0.8);
    position: sticky;
    bottom: 0;
    z-index: 50;
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

.reader__controls {
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.9);
    border-radius: var(--border-radius);
    padding: var(--spacing);
    display: flex;
    gap: var(--spacing);
    z-index: 60;
}

.reader__controls-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.reader__controls-group label {
    font-size: 0.75rem;
    color: var(--foreground-muted);
    text-transform: uppercase;
}

.reader__controls-options {
    display: flex;
    gap: 4px;
}

.reader__controls-options button {
    padding: 6px 12px;
    border-radius: var(--border-radius-sm);
    background-color: var(--secondary);
    color: var(--foreground);
    font-size: 0.75rem;
    cursor: pointer;
    border: none;
    transition: background-color var(--default-animation);
}

.reader__controls-options button:hover {
    background-color: var(--background-hover);
}

.reader__controls-options button.active {
    background-color: var(--primary);
    color: white;
}

.reader--hide-controls .reader__header,
.reader--hide-controls .reader__footer,
.reader--hide-controls .reader__controls {
    display: none;
}

.reader--hide-controls .reader__content {
    max-width: 100%;
}

@media (max-width: 600px) {
    .reader__controls {
        flex-direction: column;
        width: calc(100% - var(--spacing) * 2);
    }
}
</style>
