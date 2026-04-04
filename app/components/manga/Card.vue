<script lang="ts" setup>
import type { Manga, Tag } from '~/types/mangadex';
import { getMangaTitle, getCoverUrl, getStatusLabel, getEnglishTitle, formatDate } from '~/utils/api/mangadex';

interface Props {
    manga: Manga;
    showStatus?: boolean;
    showDetails?: boolean;
    horizontal?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
    showStatus: false,
    showDetails: false,
    horizontal: false,
    size: 'medium',
});

const mangaStore = useMangaStore();

const title = computed(() => getMangaTitle(props.manga));
const coverUrl = computed(() => getCoverUrl(props.manga.id, props.manga.relationships));
const status = computed(() => getStatusLabel(props.manga.attributes.status));
const isFavorite = computed(() => mangaStore.isFavorite(props.manga.id));

const latestChapter = computed(() => props.manga.attributes.lastChapter);
const latestVolume = computed(() => props.manga.attributes.lastVolume);
const genres = computed(() => {
    return props.manga.attributes.tags
        .filter((t: Tag) => t.attributes.group === 'genre')
        .slice(0, 3);
});

const lastUpdated = computed(() => {
    const updatedAt = props.manga.attributes.updatedAt;
    return formatDate(updatedAt);
});

const hasChapterInfo = computed(() => latestChapter.value || latestVolume.value);

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'small':
            return 'manga-card--small';
        case 'large':
            return 'manga-card--large';
        default:
            return 'manga-card--medium';
    }
});

function toggleFavorite(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    mangaStore.toggleFavorite(props.manga);
}

function getTagName(tag: Tag): string {
    return getEnglishTitle(tag.attributes.name);
}
</script>

<template>
    <NuxtLink :to="`/series/${manga.id}`" class="manga-card" :class="[sizeClasses, { 'manga-card--horizontal': horizontal }]">
        <div class="manga-card__cover">
            <img :src="coverUrl" :alt="title" loading="lazy" />
        </div>
        <div class="manga-card__info">
            <h3 class="manga-card__title">{{ title }}</h3>
            <span v-if="showStatus" class="manga-card__status">{{ status }}</span>
            
            <div v-if="showDetails" class="manga-card__details">
                <div v-if="genres.length > 0" class="manga-card__tags">
                    <span v-for="tag in genres" :key="tag.id" class="manga-card__tag">
                        {{ getTagName(tag) }}
                    </span>
                </div>
                
                <div v-if="hasChapterInfo" class="manga-card__latest">
                    <span v-if="latestVolume">Vol. {{ latestVolume }}, </span>
                    <span v-if="latestChapter">Ch. {{ latestChapter }}</span>
                </div>
                <div v-if="lastUpdated" class="manga-card__updated">
                    Updated {{ lastUpdated }}
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

<style scoped>
.manga-card {
    display: flex;
    flex-direction: column;
    border-radius: var(--border-radius);
    overflow: hidden;
    background-color: var(--card-background);
    text-decoration: none;
    color: inherit;
}

.manga-card__cover {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background-color: var(--secondary);
}

.manga-card__cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.manga-card__info {
    padding: var(--inner-gap);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.manga-card__title {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.manga-card__status {
    font-size: 0.75rem;
    color: var(--foreground-muted);
}

.manga-card__details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
}

.manga-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.manga-card__tag {
    font-size: 0.625rem;
    padding: 2px 6px;
    background-color: var(--secondary);
    border-radius: 4px;
    color: var(--foreground-muted);
}

.manga-card__latest {
    font-size: 0.75rem;
    color: var(--primary);
    font-weight: 500;
}

.manga-card__updated {
    font-size: 0.75rem;
    color: var(--foreground-muted);
}

.manga-card--small .manga-card__cover {
    aspect-ratio: 2 / 3;
}

.manga-card--small .manga-card__title {
    font-size: 0.75rem;
}

.manga-card--large .manga-card__cover {
    aspect-ratio: 3 / 4.5;
}

.manga-card--large .manga-card__title {
    font-size: 1rem;
}

.manga-card--horizontal {
    flex-direction: row;
    align-items: flex-start;
}

.manga-card--horizontal .manga-card__cover {
    width: 80px;
    height: 110px;
    flex-shrink: 0;
    aspect-ratio: auto;
    border-radius: var(--border-radius-sm);
    margin-right: var(--inner-gap);
}

.manga-card--horizontal .manga-card__info {
    flex: 1;
    min-width: 0;
    padding: var(--inner-gap) 0;
}

.manga-card--horizontal .manga-card__title {
    -webkit-line-clamp: 2;
}
</style>
