<script lang="ts" setup>
import type { Manga } from '~/types/mangadex';
import { getTrendingManga, getLatestManga, getPopularManga } from '~/utils/api/mangadex';

const mangaStore = useMangaStore();

const trending = ref<Manga[]>([]);
const latestManga = ref<Manga[]>([]);
const popularManga = ref<Manga[]>([]);

const loadingTrending = ref(true);
const loadingLatest = ref(true);
const loadingPopular = ref(true);

async function loadData() {
    try {
        const [trendingData, latestData, popularData] = await Promise.all([
            getTrendingManga(10),
            getLatestManga(20),
            getPopularManga(20),
        ]);

        trending.value = trendingData;
        mangaStore.setTrending(trendingData);
        loadingTrending.value = false;

        latestManga.value = latestData;
        mangaStore.setLatestManga(latestData);
        loadingLatest.value = false;

        popularManga.value = popularData;
        mangaStore.setPopularManga(popularManga);
        loadingPopular.value = false;
    } catch (error) {
        console.error('Failed to load homepage data:', error);
        loadingTrending.value = false;
        loadingLatest.value = false;
        loadingPopular.value = false;
    }
}

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="home">
        <section v-if="mangaStore.hasContinueReading" class="home__section home__section--continue">
            <div class="section-header">
                <h2 class="section-header__title">
                    <Icon name="mdi:book-open-page-variant" />
                    Continue Reading
                </h2>
            </div>
            <div class="continue-reading">
                <HomeReadingCard
                    v-for="reading in mangaStore.continueReading.slice(0, 5)"
                    :key="reading.chapterId"
                    :reading="reading"
                />
            </div>
        </section>

        <section class="home__section">
            <MangaGrid
                title="Trending Now"
                :manga="trending"
                view-all-link="/search?sort=trending"
                :loading="loadingTrending"
            />
        </section>

        <section class="home__section">
            <MangaGrid
                title="Latest Updates"
                :manga="latestManga"
                view-all-link="/search?sort=latest"
                :loading="loadingLatest"
            />
        </section>

        <section class="home__section">
            <MangaGrid
                title="Popular Picks"
                :manga="popularManga"
                view-all-link="/search?sort=popular"
                :loading="loadingPopular"
            />
        </section>
    </div>
</template>

<style scoped>
.home {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
}

.home__section {
}

.home__section--continue {
    background-color: var(--card-background);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing);
}

.section-header__title {
    display: flex;
    align-items: center;
    gap: var(--inner-gap);
    font-size: 1.25rem;
    font-weight: 600;
}

.continue-reading {
    display: flex;
    flex-direction: column;
    gap: var(--inner-gap);
}

@media (min-width: 768px) {
    .continue-reading {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .continue-reading {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
