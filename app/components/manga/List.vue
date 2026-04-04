<script lang="ts" setup>
import type { Chapter } from '~/types/mangadex';
import { formatDate, getChapterNumber } from '~/utils/api/mangadex';

interface Props {
    chapters: Chapter[];
    seriesId: string;
    seriesTitle: string;
    coverUrl: string;
}

const props = defineProps<Props>();
const mangaStore = useMangaStore();

function getGroupNames(chapter: Chapter): string {
    const groups = chapter.relationships.filter((r) => r.type === 'scanlation_group');
    if (groups.length === 0) return 'Unknown Group';
    return groups
        .map((g) => (g.attributes as { name?: string })?.name || 'Unknown')
        .slice(0, 2)
        .join(', ');
}

function readChapter(chapter: Chapter) {
    mangaStore.updateReadingProgress(
        props.seriesId,
        props.seriesTitle,
        props.coverUrl,
        chapter.id,
        chapter.attributes.chapter || '0',
        chapter.attributes.title || ''
    );
}
</script>

<template>
    <div class="chapter-list">
        <div v-if="chapters.length === 0" class="chapter-list__empty">
            <Icon name="mdi:book-off-outline" size="48" />
            <p>No chapters available</p>
        </div>
        <NuxtLink
            v-for="chapter in chapters"
            :key="chapter.id"
            :to="`/series/${seriesId}/chapter/${chapter.id}`"
            class="chapter-list__item"
            @click="readChapter(chapter)"
        >
            <div class="chapter-list__info">
                <span class="chapter-list__number">{{ getChapterNumber(chapter) }}</span>
                <span v-if="chapter.attributes.title" class="chapter-list__title">{{ chapter.attributes.title }}</span>
            </div>
            <div class="chapter-list__meta">
                <span class="chapter-list__group">{{ getGroupNames(chapter) }}</span>
                <span class="chapter-list__date">{{ formatDate(chapter.attributes.publishAt) }}</span>
            </div>
        </NuxtLink>
    </div>
</template>

<style scoped>
.chapter-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.chapter-list__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: calc(var(--spacing) * 2);
    color: var(--foreground-muted);
    gap: var(--inner-gap);
}

.chapter-list__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--padding) var(--inner-gap);
    background-color: var(--card-background);
    border-radius: var(--border-radius-sm);
    transition: background-color var(--default-animation);
    text-decoration: none;
    color: inherit;
}

.chapter-list__item:hover {
    background-color: var(--background-hover);
}

.chapter-list__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
}

.chapter-list__number {
    font-weight: 600;
    color: var(--primary);
}

.chapter-list__title {
    font-size: 0.875rem;
    color: var(--foreground-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chapter-list__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
    margin-left: var(--spacing);
}

.chapter-list__group {
    font-size: 0.75rem;
    color: var(--foreground-muted);
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chapter-list__date {
    font-size: 0.75rem;
    color: var(--foreground-muted);
}

@media (max-width: 480px) {
    .chapter-list__meta {
        display: none;
    }
}
</style>
