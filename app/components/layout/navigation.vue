<script lang="ts" setup>
const mangaStore = useMangaStore();

const navItems = [
    { to: '/', icon: 'mdi:home-outline', label: 'Home' },
    { to: '/search', icon: 'mdi:magnify', label: 'Search' },
    { to: '/favorites', icon: 'mdi:heart-outline', label: 'Favorites' },
];

const route = useRoute();
function isActive(to: string) {
    if (to === '/') {
        return route.path === '/';
    }
    return route.path.startsWith(to);
}
</script>

<template>
    <nav class="navigation">
        <div class="navigation__container">
            <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="navigation__item"
                :class="{ 'navigation__item--active': isActive(item.to) }"
            >
                <Icon :name="item.icon" class="navigation__icon" />
                <span class="navigation__label">{{ item.label }}</span>
                <span v-if="item.to === '/favorites' && mangaStore.favoriteCount > 0" class="navigation__badge">
                    {{ mangaStore.favoriteCount }}
                </span>
            </NuxtLink>
        </div>
    </nav>
</template>

<style scoped>
.navigation {
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: var(--padding) var(--spacing);
    border-top: 1px solid var(--border);
    position: sticky;
    bottom: 0;
    z-index: 100;
}

.navigation__container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: var(--content-width);
    margin: 0 auto;
}

.navigation__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: var(--border-radius);
    text-decoration: none;
    color: var(--foreground-muted);
    position: relative;
    min-width: 70px;
}

.navigation__item--active {
    color: var(--primary);
}

.navigation__icon {
    font-size: 24px;
}

.navigation__label {
    font-size: 0.75rem;
    font-weight: 500;
}

.navigation__badge {
    position: absolute;
    top: 2px;
    right: 8px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background-color: var(--primary);
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
