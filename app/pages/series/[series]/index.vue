<script lang="ts" setup>
import type { Manga, Chapter } from '~/types/mangadex';
import {
    getMangaById,
    getMangaChapters,
    getCoverUrl,
    getMangaTitle,
    getMangaDescription,
    getStatusLabel,
} from '~/utils/api/mangadex';

const route = useRoute();
const mangaStore = useMangaStore();

const seriesId = computed(() => route.params.series as string);

const manga = ref<Manga | null>(null);
const chapters = ref<Chapter[]>([]);
const loading = ref(true);
const chaptersLoading = ref(true);
const offset = ref(0);
const hasMore = ref(true);
const limit = 100;

const coverUrl = computed(() => manga.value ? getCoverUrl(manga.value.id, manga.value.relationships, '512') : '');
const title = computed(() => manga.value ? getMangaTitle(manga.value) : '');
const description = computed(() => manga.value ? getMangaDescription(manga.value) : '');
const status = computed(() => manga.value ? getStatusLabel(manga.value.attributes.status) : '');
const isFavorite = computed(() => mangaStore.isFavorite(seriesId.value));

const authors = computed(() => {
    if (!manga.value) return [];
    return manga.value.relationships
        .filter((r) => r.type === 'author' || r.type === 'artist')
        .map((r) => {
            const attrs = r.attributes as { name?: string };
            return attrs.name || 'Unknown';
        });
});

const tags = computed(() => {
    if (!manga.value) return [];
    return manga.value.attributes.tags;
});

const groupedChapters = computed(() => {
    const groups: Record<string, Chapter[]> = {};
    chapters.value.forEach((chapter) => {
        const volume = chapter.attributes.volume || 'Chapters';
        if (!groups[volume]) {
            groups[volume] = [];
        }
        groups[volume].push(chapter);
    });
    return groups;
});

const sortedVolumes = computed(() => {
    return Object.keys(groupedChapters.value).sort((a, b) => {
        if (a === 'Chapters') return 1;
        if (b === 'Chapters') return -1;
        return parseFloat(b) - parseFloat(a);
    });
});

async function loadManga() {
    loading.value = true;
    try {
        const response = await getMangaById(seriesId.value);
        manga.value = response.data;
        mangaStore.setCurrentSeries(manga.value);
    } catch (error) {
        console.error('Failed to load manga:', error);
    } finally {
        loading.value = false;
    }
}

async function loadChapters(reset = false) {
    if (reset) {
        offset.value = 0;
        chapters.value = [];
        hasMore.value = true;
    }

    if (!hasMore.value && !reset) return;

    chaptersLoading.value = true;

    try {
        const response = await getMangaChapters(seriesId.value, {
            translatedLanguage: ['en'],
            limit: limit,
            offset: offset.value,
            order: {
                chapter: 'desc',
            },
        });

        if (reset) {
            chapters.value = response.data;
        } else {
            chapters.value = [...chapters.value, ...response.data];
        }

        hasMore.value = chapters.value.length < response.total;
        offset.value += response.data.length;
        mangaStore.setCurrentChapters(chapters.value);
    } catch (error) {
        console.error('Failed to load chapters:', error);
    } finally {
        chaptersLoading.value = false;
    }
}

function loadMore() {
    if (!chaptersLoading.value && hasMore.value) {
        loadChapters();
    }
}

function toggleFavorite() {
    if (manga.value) {
        mangaStore.toggleFavorite(manga.value);
    }
}

function readChapter(chapter: Chapter) {
    mangaStore.updateReadingProgress(
        seriesId.value,
        title.value,
        coverUrl.value,
        chapter.id,
        chapter.attributes.chapter || '0',
        chapter.attributes.title || ''
    );
}

watch(seriesId, () => {
    loadManga();
    loadChapters(true);
});

onMounted(() => {
    loadManga();
    loadChapters();
});

useHead(() => ({
    title: title.value ? `${title.value} - Zen Manga` : 'Loading... - Zen Manga',
}));
</script>

<template>
    <div class="series-page">
        <div v-if="loading" class="series-page__loading">
            <UiLoadingSpinner size="large" />
        </div>

        <template v-else-if="manga">
            <div class="series-page__hero">
                <div class="series-page__cover">
                    <img :src="coverUrl" :alt="title" />
                </div>
                <div class="series-page__info">
                    <h1 class="series-page__title">{{ title }}</h1>
                    
                    <div class="series-page__meta">
                        <span v-if="status" class="meta-item">
                            <Icon name="mdi:circle" class="meta-item__icon meta-item__icon--status" />
                            {{ status }}
                        </span>
                        <span v-if="authors.length > 0" class="meta-item">
                            <Icon name="mdi:account" class="meta-item__icon" />
                            {{ authors.join(', ') }}
                        </span>
                    </div>

                    <div class="series-page__tags" v-if="tags.length > 0">
                        <UiGenreTag v-for="tag in tags.slice(0, 5)" :key="tag.id" :tag="tag" size="small" />
                    </div>

                    <p class="series-page__description">{{ description }}</p>

                    <div class="series-page__actions">
                        <button
                            class="action-btn action-btn--favorite"
                            :class="{ 'action-btn--active': isFavorite }"
                            @click="toggleFavorite"
                        >
                            <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" />
                            {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
                        </button>
                        <NuxtLink
                            v-if="chapters.length > 0"
                            :to="`/series/${seriesId}/chapter/${chapters[0]?.id}`"
                            class="action-btn action-btn--read"
                        >
                            <Icon name="mdi:book-open-variant" />
                            Read Chapter {{ chapters[0]?.attributes.chapter || '1' }}
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <div class="series-page__chapters">
                <div class="section-header">
                    <h2 class="section-header__title">
                        <Icon name="mdi:format-list-numbered" />
                        Chapters ({{ chapters.length }})
                    </h2>
                </div>

                <div v-if="chaptersLoading && chapters.length === 0" class="series-page__chapters-loading">
                    <UiLoadingSpinner />
                </div>

                <template v-else>
                    <div v-for="volume in sortedVolumes" :key="volume" class="volume-group">
                        <h3 class="volume-group__title" v-if="volume !== 'Chapters'">Volume {{ volume }}</h3>
                        <div class="volume-group__chapters">
                            <NuxtLink
                                v-for="chapter in groupedChapters[volume]"
                                :key="chapter.id"
                                :to="`/series/${seriesId}/chapter/${chapter.id}`"
                                class="chapter-item"
                                @click="readChapter(chapter)"
                            >
                                <div class="chapter-item__info">
                                    <span class="chapter-item__number">Ch. {{ chapter.attributes.chapter || 'Oneshot' }}</span>
                                    <span v-if="chapter.attributes.title" class="chapter-item__title">{{ chapter.attributes.title }}</span>
                                </div>
                                <div class="chapter-item__meta">
                                    <span class="chapter-item__date">{{ new Date(chapter.attributes.publishAt).toLocaleDateString() }}</span>
                                </div>
                            </NuxtLink>
                        </div>
                    </div>

                    <div v-if="hasMore" class="series-page__load-more">
                        <button class="load-more-btn" @click="loadMore" :disabled="chaptersLoading">
                            <span v-if="chaptersLoading">Loading...</span>
                            <span v-else>Load More Chapters</span>
                        </button>
                    </div>
                </template>
            </div>
        </template>

        <div v-else class="series-page__error">
            <Icon name="mdi:alert-circle-outline" size="64" />
            <p>Failed to load manga details</p>
            <NuxtLink to="/" class="back-link">Go back home</NuxtLink>
        </div>

        <NuxtPage />
    </div>
</template>

<style scoped>
.series-page {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.series-page__loading,
.series-page__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing);
    padding: var(--spacing) * 3;
    color: var(--foreground-muted);
    text-align: center;
}

.back-link {
    color: var(--primary);
    font-weight: 500;
}

.series-page__hero {
    display: flex;
    gap: var(--spacing);
    padding: var(--spacing);
    background-color: var(--card-background);
    border-radius: var(--border-radius-lg);
}

.series-page__cover {
    width: 160px;
    height: 240px;
    border-radius: var(--border-radius);
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: var(--shadow-lg);
}

.series-page__cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.series-page__info {
    display: flex;
    flex-direction: column;
    gap: var(--inner-gap);
    min-width: 0;
}

.series-page__title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
}

.series-page__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing);
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--foreground-muted);
}

.meta-item__icon {
    font-size: 16px;
}

.meta-item__icon--status {
    color: var(--success);
}

.series-page__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.series-page__description {
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--foreground-muted);
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.series-page__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--inner-gap);
    margin-top: auto;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    text-decoration: none;
}

.action-btn--favorite {
    background-color: var(--secondary);
    color: var(--foreground);
}

.action-btn--favorite.action-btn--active {
    background-color: var(--primary);
    color: white;
}

.action-btn--read {
    background-color: var(--primary);
    color: white;
}

.series-page__chapters {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-header__title {
    display: flex;
    align-items: center;
    gap: var(--inner-gap);
    font-size: 1.25rem;
    font-weight: 600;
}

.series-page__chapters-loading {
    display: flex;
    justify-content: center;
    padding: var(--spacing);
}

.volume-group {
    display: flex;
    flex-direction: column;
    gap: var(--inner-gap);
}

.volume-group__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary);
    padding: var(--inner-gap) 0;
    border-bottom: 1px solid var(--border);
}

.volume-group__chapters {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.chapter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--padding) var(--inner-gap);
    background-color: var(--card-background);
    border-radius: var(--border-radius-sm);
    text-decoration: none;
    color: inherit;
}

.chapter-item__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
}

.chapter-item__number {
    font-weight: 600;
    color: var(--primary);
}

.chapter-item__title {
    font-size: 0.875rem;
    color: var(--foreground-muted);
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
}

.chapter-item__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
    margin-left: var(--spacing);
}

.chapter-item__date {
    font-size: 0.75rem;
    color: var(--foreground-muted);
}

.series-page__load-more {
    display: flex;
    justify-content: center;
    padding: var(--spacing);
}

.load-more-btn {
    padding: 12px 32px;
    background-color: var(--primary);
    color: white;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
}

.load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 600px) {
    .series-page__hero {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .series-page__cover {
        width: 180px;
        height: 270px;
    }

    .series-page__meta {
        justify-content: center;
    }

    .series-page__tags {
        justify-content: center;
    }

    .series-page__actions {
        justify-content: center;
    }
}
</style>
