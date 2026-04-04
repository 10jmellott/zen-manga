<script lang="ts" setup>
import type { Tag } from '~/types/mangadex';
import { getTags, getEnglishTitle } from '~/utils/api/mangadex';

const tags = ref<Tag[]>([]);
const loading = ref(true);

async function loadTags() {
    loading.value = true;
    try {
        const response = await getTags();
        tags.value = response.data.filter((t) => t.attributes.group === 'genre');
    } catch (error) {
        console.error('Failed to load tags:', error);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadTags();
});

useHead({
    title: 'Browse Genres - Zen Manga',
});
</script>

<template>
    <div class="genres-page">
        <h1 class="genres-page__title">Browse Genres</h1>
        <p class="genres-page__description">Explore manga by genre to find your next favorite series</p>

        <div v-if="loading" class="genres-page__loading">
            <UiLoadingSpinner size="large" />
        </div>

        <div v-else class="genres-page__grid">
            <NuxtLink
                v-for="tag in tags"
                :key="tag.id"
                :to="`/genre/${tag.id}`"
                class="genre-card"
            >
                <span class="genre-card__name">{{ getEnglishTitle([tag.attributes.name]) }}</span>
                <Icon name="mdi:chevron-right" class="genre-card__icon" />
            </NuxtLink>
        </div>
    </div>
</template>

<style scoped>
.genres-page {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.genres-page__title {
    font-size: 1.75rem;
    font-weight: 700;
}

.genres-page__description {
    color: var(--foreground-muted);
    font-size: 0.875rem;
}

.genres-page__loading {
    display: flex;
    justify-content: center;
    padding: var(--spacing) * 3;
}

.genres-page__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--inner-gap);
}

.genre-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing);
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: var(--foreground);
    transition: background-color var(--default-animation), transform var(--default-animation);
}

.genre-card:hover {
    background-color: var(--background-hover);
    transform: translateX(4px);
}

.genre-card__name {
    font-weight: 600;
}

.genre-card__icon {
    color: var(--primary);
}
</style>
