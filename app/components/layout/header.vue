<script lang="ts" setup>
</script>

<template>
    <header class="header">
        <div class="header__container">
            <NuxtLink to="/" class="header__brand">
                <Icon name="mdi:book-open-blank-variant" class="header__icon" />
                <span class="header__title">Zen Manga</span>
            </NuxtLink>
        </div>
    </header>
</template>

<style scoped>
.header {
    background: rgba(15, 15, 15, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: var(--fullscreen-padding);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: var(--content-width);
    margin: 0 auto;
    gap: var(--spacing);
}

.header__brand {
    display: flex;
    align-items: center;
    gap: var(--inner-gap);
    text-decoration: none;
    color: var(--foreground);
}

.header__icon {
    font-size: 28px;
    color: var(--primary);
}

.header__title {
    font-size: 1.25rem;
    font-weight: 700;
}
</style>
