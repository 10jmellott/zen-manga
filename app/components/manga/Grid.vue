<script lang="ts" setup>
import type { Manga } from '~/types/mangadex';

interface Props {
    manga: Manga[];
    title?: string;
    viewAllLink?: string;
    loading?: boolean;
}

defineProps<Props>();
</script>

<template>
    <section class="manga-grid">
        <div class="manga-grid__header" v-if="title || viewAllLink">
            <h2 v-if="title" class="manga-grid__title">{{ title }}</h2>
            <NuxtLink v-if="viewAllLink" :to="viewAllLink" class="manga-grid__view-all">
                View All
                <Icon name="mdi:chevron-right" />
            </NuxtLink>
        </div>
        <div class="manga-grid__loading" v-if="loading">
            <div class="manga-grid__spinner"></div>
        </div>
        <div class="manga-grid__items" v-else>
            <MangaCard v-for="item in manga" :key="item.id" :manga="item" />
            <div v-if="manga.length === 0 && !loading" class="manga-grid__empty">
                <p>No manga found</p>
            </div>
        </div>
    </section>
</template>

<style scoped>
.manga-grid__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing);
}

.manga-grid__title {
    font-size: 1.25rem;
    font-weight: 600;
}

.manga-grid__view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--primary);
    font-size: 0.875rem;
    font-weight: 500;
    transition: color var(--default-animation);
}

.manga-grid__view-all:hover {
    color: var(--primary-hover);
}

.manga-grid__items {
    display: flex;
    gap: var(--spacing);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: var(--inner-gap);
}

.manga-grid__items::-webkit-scrollbar {
    display: none;
}

.manga-grid__items > * {
    flex-shrink: 0;
    width: 140px;
    scroll-snap-align: start;
}

.manga-grid__loading {
    display: flex;
    justify-content: center;
    padding: var(--spacing);
}

.manga-grid__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--secondary);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.manga-grid__empty {
    text-align: center;
    padding: var(--spacing);
    color: var(--foreground-muted);
}

@media (min-width: 768px) {
    .manga-grid__items {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        overflow-x: visible;
        scroll-snap-type: none;
    }

    .manga-grid__items > * {
        width: auto;
        scroll-snap-align: none;
    }
}
</style>
