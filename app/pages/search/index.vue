<script lang="ts" setup>
import type { Manga, Tag } from '~/types/mangadex';
import { searchManga, getTags } from '~/utils/api/mangadex';

const route = useRoute();
const router = useRouter();

const searchQuery = ref((route.query.q as string) || '');
const results = ref<Manga[]>([]);
const tags = ref<Tag[]>([]);
const selectedTags = ref<string[]>([]);
const selectedStatus = ref<string[]>([]);
const sortBy = ref<string>('latestUploadedChapter');
const loading = ref(false);
const hasSearched = ref(false);
const showFilters = ref(false);
const currentSortLabel = ref('Latest Updates');

const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'hiatus', label: 'Hiatus' },
    { value: 'cancelled', label: 'Cancelled' },
];

const sortOptions = [
    { value: 'latestUploadedChapter', label: 'Latest Updates' },
    { value: 'followedCount', label: 'Most Popular' },
    { value: 'relevance', label: 'Browse All' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'createdAt', label: 'Newest Added' },
];

const sortLabelMap: Record<string, string> = {
    trending: 'Trending',
    latest: 'Latest Updates',
    popular: 'Most Popular',
};

async function performSearch(overrideQuery?: string) {
    loading.value = true;
    hasSearched.value = true;

    const query = overrideQuery !== undefined ? overrideQuery : searchQuery.value;

    try {
        const orderMap: Record<string, Record<string, string>> = {
            relevance: {},
            followedCount: { followedCount: 'desc' },
            latestUploadedChapter: { latestUploadedChapter: 'desc' },
            title: { title: 'asc' },
            createdAt: { createdAt: 'desc' },
        };

        const response = await searchManga({
            title: query.trim() || undefined,
            includedTags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
            status: selectedStatus.value.length > 0 ? selectedStatus.value : undefined,
            contentRating: ['safe', 'suggestive'],
            limit: 40,
            order: orderMap[sortBy.value] || {},
        });
        results.value = response.data;
    } catch (error) {
        console.error('Search failed:', error);
        results.value = [];
    } finally {
        loading.value = false;
    }
}

async function loadTags() {
    try {
        const response = await getTags();
        tags.value = response.data.filter((t) => t.attributes.group === 'genre');
    } catch (error) {
        console.error('Failed to load tags:', error);
    }
}

function toggleTag(tagId: string) {
    const index = selectedTags.value.indexOf(tagId);
    if (index >= 0) {
        selectedTags.value.splice(index, 1);
    } else {
        selectedTags.value.push(tagId);
    }
    performSearch();
}

function toggleStatus(status: string) {
    const index = selectedStatus.value.indexOf(status);
    if (index >= 0) {
        selectedStatus.value.splice(index, 1);
    } else {
        selectedStatus.value.push(status);
    }
    performSearch();
}

function handleSortChange() {
    const option = sortOptions.find(o => o.value === sortBy.value);
    currentSortLabel.value = option?.label || 'Browse All';
    performSearch();
}

function clearFilters() {
    selectedTags.value = [];
    selectedStatus.value = [];
    sortBy.value = 'relevance';
    currentSortLabel.value = 'Browse All';
    performSearch();
}

function handleSearch() {
    router.replace({ query: { q: searchQuery.value, sort: sortBy.value } });
    performSearch();
}

function handleSortFromQuery(sortValue: string) {
    if (sortValue && sortLabelMap[sortValue]) {
        sortBy.value = sortValue === 'latest' ? 'latestUploadedChapter' 
                      : sortValue === 'popular' ? 'followedCount' 
                      : sortValue === 'trending' ? 'followedCount' 
                      : 'relevance';
        currentSortLabel.value = sortLabelMap[sortValue];
    }
}

watch(() => route.query.q, (newQuery) => {
    searchQuery.value = (newQuery as string) || '';
});

watch(() => route.query.sort, (newSort) => {
    if (newSort) {
        handleSortFromQuery(newSort as string);
        performSearch();
    }
}, { immediate: true });

onMounted(() => {
    loadTags();
    if (route.query.sort) {
        handleSortFromQuery(route.query.sort as string);
    }
    performSearch();
});
</script>

<template>
    <div class="search-page">
        <div class="search-page__header">
            <h1 class="search-page__title">{{ currentSortLabel }}</h1>
            <div class="search-page__form">
                <input
                    v-model="searchQuery"
                    type="text"
                    class="search-page__input"
                    placeholder="Search manga titles..."
                    @keyup.enter="handleSearch"
                />
                <button class="search-page__submit" @click="handleSearch">
                    <Icon name="mdi:magnify" />
                </button>
            </div>
        </div>

        <div class="search-page__controls">
            <select v-model="sortBy" class="search-page__sort" @change="handleSortChange">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
            <button class="search-page__toggle-filters" @click="showFilters = !showFilters">
                <Icon :name="showFilters ? 'mdi:filter-off' : 'mdi:filter-variant'" />
            </button>
        </div>

        <div v-if="showFilters" class="search-page__filters">
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

            <button v-if="selectedTags.length > 0 || selectedStatus.length > 0" class="filter-clear" @click="clearFilters">
                <Icon name="mdi:close" />
                Clear filters
            </button>
        </div>

        <div class="search-page__results">
            <div v-if="loading" class="search-page__loading">
                <UiLoadingSpinner size="large" />
                <p>Loading...</p>
            </div>

            <div v-else-if="!hasSearched" class="search-page__empty">
                <Icon name="mdi:magnify" size="64" />
                <p>Search or browse manga</p>
            </div>

            <div v-else-if="results.length === 0" class="search-page__empty">
                <Icon name="mdi:book-off-outline" size="64" />
                <p>No manga found</p>
                <p class="search-page__hint">Try different keywords or adjust your filters</p>
            </div>

            <div v-else class="search-page__grid">
                <MangaCard
                    v-for="manga in results"
                    :key="manga.id"
                    :manga="manga"
                    show-status
                    show-details
                    horizontal
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-page {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.search-page__header {
    display: flex;
    flex-direction: column;
    gap: var(--inner-gap);
}

.search-page__title {
    font-size: 1.5rem;
    font-weight: 700;
}

.search-page__form {
    display: flex;
    gap: var(--inner-gap);
}

.search-page__input {
    flex: 1;
    padding: 12px 16px;
    background-color: var(--card-background);
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    color: var(--foreground);
    font-size: 1rem;
    outline: none;
    transition: border-color var(--default-animation);
}

.search-page__input::placeholder {
    color: var(--foreground-muted);
}

.search-page__input:focus {
    border-color: var(--primary);
}

.search-page__submit {
    width: 48px;
    height: 48px;
    background-color: var(--primary);
    color: white;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
}

.search-page__controls {
    display: flex;
    gap: var(--inner-gap);
}

.search-page__sort {
    flex: 1;
    padding: 10px 12px;
    background-color: var(--card-background);
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    color: var(--foreground);
    font-size: 0.875rem;
    outline: none;
    cursor: pointer;
}

.search-page__toggle-filters {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background-color: var(--secondary);
    color: var(--foreground);
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
}

.search-page__filters {
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

.filter-group__options {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.filter-chip {
    padding: 6px 12px;
    background-color: var(--background);
    color: var(--foreground);
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid var(--border);
}

.filter-chip--active {
    background-color: var(--primary);
    color: white;
    border-color: var(--primary);
}

.filter-clear {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background-color: transparent;
    color: var(--foreground-muted);
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    align-self: flex-end;
}

.search-page__results {
    min-height: 300px;
}

.search-page__loading,
.search-page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing);
    padding: var(--spacing) * 3;
    color: var(--foreground-muted);
    text-align: center;
}

.search-page__hint {
    font-size: 0.875rem;
}

.search-page__grid {
    display: flex;
    flex-direction: column;
    gap: var(--inner-gap);
}

@media (min-width: 640px) {
    .search-page__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--spacing);
    }
}

@media (min-width: 768px) {
    .search-page__grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
}
</style>
