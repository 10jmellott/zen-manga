<script lang="ts" setup>
import type { Manga, Tag } from '~/types/mangadex';
import { searchManga, getTags, getEnglishTitle } from '~/utils/api/mangadex';

const route = useRoute();
const tagId = computed(() => route.params.tag as string);

const allTags = ref<Tag[]>([]);
const currentTag = ref<Tag | null>(null);
const results = ref<Manga[]>([]);
const loading = ref(true);
const offset = ref(0);
const hasMore = ref(true);
const limit = 20;

const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
];
const selectedStatus = ref<string[]>([]);
const sortBy = ref<string>('relevance');

const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'latestUploadedChapter', label: 'Latest' },
    { value: 'title', label: 'Title' },
    { value: 'followedCount', label: 'Popularity' },
];

async function loadTags() {
    try {
        const response = await getTags();
        allTags.value = response.data.filter((t) => t.attributes.group === 'genre');
        currentTag.value = allTags.value.find((t) => t.id === tagId.value) || null;
    } catch (error) {
        console.error('Failed to load tags:', error);
    }
}

async function loadManga(reset = false) {
    if (reset) {
        offset.value = 0;
        results.value = [];
        hasMore.value = true;
    }

    if (!hasMore.value && !reset) return;

    loading.value = true;

    try {
        const response = await searchManga({
            includedTags: [tagId.value],
            status: selectedStatus.value.length > 0 ? selectedStatus.value : undefined,
            contentRating: ['safe', 'suggestive'],
            limit: limit,
            offset: offset.value,
            order: {
                [sortBy.value]: 'desc',
            },
        });

        if (reset) {
            results.value = response.data;
        } else {
            results.value = [...results.value, ...response.data];
        }

        hasMore.value = results.value.length < response.total;
        offset.value += response.data.length;
    } catch (error) {
        console.error('Failed to load manga:', error);
    } finally {
        loading.value = false;
    }
}

function toggleStatus(status: string) {
    const index = selectedStatus.value.indexOf(status);
    if (index >= 0) {
        selectedStatus.value.splice(index, 1);
    } else {
        selectedStatus.value.push(status);
    }
    loadManga(true);
}

function handleSortChange() {
    loadManga(true);
}

function loadMore() {
    if (!loading.value && hasMore.value) {
        loadManga();
    }
}

watch(tagId, () => {
    currentTag.value = allTags.value.find((t) => t.id === tagId.value) || null;
    loadManga(true);
});

onMounted(async () => {
    await loadTags();
    if (currentTag.value) {
        loadManga();
    }
});

useHead(() => ({
    title: currentTag.value
        ? `${getEnglishTitle([currentTag.value.attributes.name])} - Zen Manga`
        : 'Browse Genres - Zen Manga',
}));
</script>

<template>
    <div class="genre-page">
        <div class="genre-page__header">
            <NuxtLink to="/genre" class="genre-page__back">
                <Icon name="mdi:arrow-left" />
                All Genres
            </NuxtLink>
            <h1 class="genre-page__title" v-if="currentTag">
                {{ getEnglishTitle([currentTag.attributes.name]) }}
            </h1>
            <p class="genre-page__description" v-if="currentTag && currentTag.attributes.description">
                {{ getEnglishTitle([currentTag.attributes.description]) }}
            </p>
        </div>

        <div class="genre-page__filters">
            <div class="filter-group">
                <label class="filter-group__label">Sort by</label>
                <select v-model="sortBy" class="filter-group__select" @change="handleSortChange">
                    <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <div class="filter-group">
                <label class="filter-group__label">Status</label>
                <div class="filter-group__options">
                    <button
                        v-for="status in statusOptions"
                        :key="status.value"
                        class="filter-chip"
                        :class="{ 'filter-chip--active': selectedStatus.includes(status.value) }"
                        @click="toggleStatus(status.value)"
                    >
                        {{ status.label }}
                    </button>
                </div>
            </div>
        </div>

        <div class="genre-page__results">
            <div v-if="loading && results.length === 0" class="genre-page__loading">
                <UiLoadingSpinner size="large" />
            </div>

            <div v-else-if="results.length === 0 && !loading" class="genre-page__empty">
                <Icon name="mdi:book-off-outline" size="64" />
                <p>No manga found in this genre</p>
            </div>

            <div v-else class="genre-page__grid">
                <MangaCard
                    v-for="manga in results"
                    :key="manga.id"
                    :manga="manga"
                    show-status
                />
            </div>

            <div v-if="hasMore && results.length > 0" class="genre-page__load-more">
                <button class="load-more-btn" @click="loadMore" :disabled="loading">
                    <span v-if="loading">Loading...</span>
                    <span v-else>Load More</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.genre-page {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.genre-page__header {
    display: flex;
    flex-direction: column;
    gap: var(--inner-gap);
}

.genre-page__back {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary);
    font-size: 0.875rem;
    font-weight: 500;
}

.genre-page__title {
    font-size: 1.75rem;
    font-weight: 700;
}

.genre-page__description {
    color: var(--foreground-muted);
    font-size: 0.875rem;
    line-height: 1.5;
}

.genre-page__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing);
    padding: var(--spacing);
    background-color: var(--card-background);
    border-radius: var(--border-radius);
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.filter-group__label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--foreground-muted);
    text-transform: uppercase;
}

.filter-group__select {
    padding: 8px 12px;
    background-color: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    color: var(--foreground);
    font-size: 0.875rem;
    outline: none;
    cursor: pointer;
}

.filter-group__options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.filter-chip {
    padding: 6px 12px;
    background-color: var(--secondary);
    color: var(--foreground);
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background-color var(--default-animation), color var(--default-animation);
}

.filter-chip:hover {
    background-color: var(--background-hover);
}

.filter-chip--active {
    background-color: var(--primary);
    color: white;
}

.genre-page__loading,
.genre-page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing);
    padding: var(--spacing) * 3;
    color: var(--foreground-muted);
    text-align: center;
}

.genre-page__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing);
}

.genre-page__load-more {
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
    transition: background-color var(--default-animation);
}

.load-more-btn:hover:not(:disabled) {
    background-color: var(--primary-hover);
}

.load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (min-width: 768px) {
    .genre-page__grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
}
</style>
