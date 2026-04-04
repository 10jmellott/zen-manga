<script lang="ts" setup>
import type { ReadingState } from '~/types/mangadex';

interface Props {
    reading: ReadingState;
}

defineProps<Props>();
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
        </div>
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
    min-width: 200px;
}

.continue-card__cover {
    width: 60px;
    height: 85px;
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
    flex: 1;
}

.continue-card__title {
    font-size: 0.875rem;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.continue-card__chapter {
    font-size: 0.75rem;
    color: var(--primary);
}
</style>
