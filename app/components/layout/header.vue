<template>
    <header>
        <div>
            <Icon name="mdi:book-open-blank-variant-outline" />
            <span>Zen Manga</span>
        </div>
    </header>
</template>

<style scoped>
header {
    background-color: var(--card-background);
    font-size: 1.25rem;
    padding: var(--fullscreen-padding);
    display: flex;

    div {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: var(--inner-gap);
        width: 100%;
        max-width: var(--content-width);
        margin: 0 auto;
    }
}
</style>
