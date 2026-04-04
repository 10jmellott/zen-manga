<script lang="ts" setup>
const mangaStore = useMangaStore();

const favorites = computed(() => mangaStore.favorites);

function removeFavorite(id: string) {
    const manga = favorites.value.find((f) => f.id === id);
    if (manga) {
        const fakeManga = {
            id: manga.id,
            type: 'manga' as const,
            attributes: {
                title: { en: manga.title },
                altTitles: [],
                description: { en: '' },
                status: 'unknown' as const,
                year: null,
                contentRating: 'safe' as const,
                tags: [],
                originalLanguage: 'en',
                lastChapter: null,
                lastVolume: null,
                demographic: null,
                createdAt: '',
                updatedAt: '',
                availableTranslatedLanguages: ['en'],
                state: 'published' as const,
            },
            relationships: [],
        };
        mangaStore.toggleFavorite(fakeManga);
    }
}

useHead({
    title: 'Favorites - Zen Manga',
});
</script>

<template>
    <div class="favorites-page">
        <h1 class="favorites-page__title">My Favorites</h1>
        <p class="favorites-page__description">{{ favorites.length }} series saved</p>

        <div v-if="favorites.length === 0" class="favorites-page__empty">
            <Icon name="mdi:heart-outline" size="64" />
            <p>No favorites yet</p>
            <p class="favorites-page__hint">Tap the heart icon on any manga to add it to your favorites</p>
            <NuxtLink to="/" class="explore-link">
                <Icon name="mdi:compass" />
                Explore Manga
            </NuxtLink>
        </div>

        <div v-else class="favorites-page__grid">
            <div v-for="favorite in favorites" :key="favorite.id" class="favorite-card">
                <NuxtLink :to="`/series/${favorite.id}`" class="favorite-card__cover">
                    <img :src="favorite.coverUrl" :alt="favorite.title" />
                </NuxtLink>
                <div class="favorite-card__info">
                    <NuxtLink :to="`/series/${favorite.id}`" class="favorite-card__title">
                        {{ favorite.title }}
                    </NuxtLink>
                    <span class="favorite-card__date">
                        Added {{ new Date(favorite.addedAt).toLocaleDateString() }}
                    </span>
                </div>
                <button
                    class="favorite-card__remove"
                    @click="removeFavorite(favorite.id)"
                    aria-label="Remove from favorites"
                >
                    <Icon name="mdi:heart" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.favorites-page {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.favorites-page__title {
    font-size: 1.75rem;
    font-weight: 700;
}

.favorites-page__description {
    color: var(--foreground-muted);
    font-size: 0.875rem;
}

.favorites-page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing);
    padding: var(--spacing) * 3;
    color: var(--foreground-muted);
    text-align: center;
}

.favorites-page__hint {
    font-size: 0.875rem;
}

.explore-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background-color: var(--primary);
    color: white;
    border-radius: var(--border-radius);
    font-weight: 600;
    text-decoration: none;
    margin-top: var(--spacing);
}

.favorites-page__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing);
}

.favorite-card {
    display: flex;
    gap: var(--spacing);
    padding: var(--inner-gap);
    background-color: var(--card-background);
    border-radius: var(--border-radius);
    position: relative;
}

.favorite-card__cover {
    width: 80px;
    height: 120px;
    border-radius: var(--border-radius-sm);
    overflow: hidden;
    flex-shrink: 0;
}

.favorite-card__cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.favorite-card__info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    min-width: 0;
}

.favorite-card__title {
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.favorite-card__date {
    font-size: 0.75rem;
    color: var(--foreground-muted);
}

.favorite-card__remove {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
}
</style>
