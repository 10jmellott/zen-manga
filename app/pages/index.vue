<script lang="ts" setup>
import type { Manga } from '~/types/mangadex';
import { getLatestManga, getPopularManga } from '~/utils/api/mangadex';

const mangaStore = useMangaStore();

const latestManga = ref<Manga[]>([]);
const popularManga = ref<Manga[]>([]);

const loadingLatest = ref(true);
const loadingPopular = ref(true);

async function loadData() {
    try {
        const [latestData, popularData] = await Promise.all([
            getLatestManga(20),
            getPopularManga(20),
        ]);

        latestManga.value = latestData;
        mangaStore.setLatestManga(latestData);
        loadingLatest.value = false;

        popularManga.value = popularData;
        mangaStore.setPopularManga(popularManga);
        loadingPopular.value = false;
    } catch (error) {
        console.error('Failed to load homepage data:', error);
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
                    v-for="reading in mangaStore.continueReading.slice(0, 10)"
                    :key="reading.chapterId"
                    :reading="reading"
                />
            </div>
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
    gap: var(--inner-gap);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: var(--inner-gap);
    padding-left: 16px;
    padding-right: 16px;
    margin: 0 -16px;
}

.continue-reading::-webkit-scrollbar {
    display: none;
}
</style>
