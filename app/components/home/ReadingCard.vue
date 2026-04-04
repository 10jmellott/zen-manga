<script lang="ts" setup>
import type { ReadingState } from '~/types/mangadex';

interface Props {
    reading: ReadingState;
}

defineProps<Props>();
const mangaStore = useMangaStore();

function removeFromHistory(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    mangaStore.removeFromContinueReading(e.currentTarget as HTMLElement);
}
</script>

<template>
    <NuxtLink :to="`/series/${reading.seriesId}/chapter/${reading.chapterId}`" class="continue-card">
        <div class="continue-card__cover">
            <img :src="reading.coverUrl" :alt="reading.seriesTitle" loading="lazy" />
        </div>
        <div class="continue-card__info">
            <h3 class="continue-card__title">{{ reading.seriesTitle }}</h3>
            <span class="continue-card__chapter">
                {{ reading.chapterNumber }}{{ reading.chapterTitle ? ` - ${reading.chapterTitle}` : '' }}
            </span>
            <span class="continue-card__action">
                <Icon name="mdi:book-open-page-variant" />
                Continue Reading
            </span>
        </div>
        <button class="continue-card__remove" @click="removeFromHistory" aria-label="Remove from history">
            <Icon name="mdi:close" />
        </button>
    </NuxtLink>
</template>

<style scoped>
.continue-card {
    display: flex;
    gap: var(--spacing);
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: inherit;
    position: relative;
}

.continue-card__cover {
    width: 80px;
    height: 110px;
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    flex-shrink: 0;
}

.continue-card__cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.continue-card__info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    min-width: 0;
}

.continue-card__title {
    font-size: 1rem;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.continue-card__chapter {
    font-size: 0.875rem;
    color: var(--primary);
}

.continue-card__action {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--foreground-muted);
    margin-top: 4px;
}

.continue-card__remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
}
</style>
