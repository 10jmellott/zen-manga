<script lang="ts" setup>
import type { Manga } from '~/types/mangadex';
import { getMangaTitle, getCoverUrl, getStatusLabel } from '~/utils/api/mangadex';

interface Props {
    manga: Manga;
    showStatus?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
    showStatus: false,
    size: 'medium',
});

const mangaStore = useMangaStore();

const title = computed(() => getMangaTitle(props.manga));
const coverUrl = computed(() => getCoverUrl(props.manga.id, props.manga.relationships));
const status = computed(() => getStatusLabel(props.manga.attributes.status));
const isFavorite = computed(() => mangaStore.isFavorite(props.manga.id));

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
</script>

<template>
    <NuxtLink :to="`/series/${manga.id}`" class="manga-card" :class="sizeClasses">
        <div class="manga-card__cover">
            <img :src="coverUrl" :alt="title" loading="lazy" />
            <button
                class="manga-card__favorite"
                :class="{ 'manga-card__favorite--active': isFavorite }"
                @click="toggleFavorite"
                :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
            >
                <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" />
            </button>
        </div>
        <div class="manga-card__info">
            <h3 class="manga-card__title">{{ title }}</h3>
            <span v-if="showStatus" class="manga-card__status">{{ status }}</span>
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
    transition: transform var(--default-animation), box-shadow var(--default-animation);
    text-decoration: none;
    color: inherit;
}

.manga-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
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
    transition: transform var(--transition-slow);
}

.manga-card:hover .manga-card__cover img {
    transform: scale(1.05);
}

.manga-card__favorite {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--default-animation), background-color var(--default-animation);
    cursor: pointer;
    border: none;
}

.manga-card:hover .manga-card__favorite {
    opacity: 1;
}

.manga-card__favorite:hover {
    background-color: var(--primary);
}

.manga-card__favorite--active {
    opacity: 1;
    color: var(--primary);
}

.manga-card__favorite--active:hover {
    color: white;
}

.manga-card__info {
    padding: var(--inner-gap);
}

.manga-card__title {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 4px;
}

.manga-card__status {
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
</style>
