<template>
    <nav>
        <div>
			<NuxtLink to="/">Home</NuxtLink>
        </div>
    </nav>
</template>

<style scoped>
nav {
	background-color: var(--card-background);
    padding: var(--fullscreen-padding);

    div {
        display: flex;
        align-items: center;
        gap: var(--inner-gap);
        max-width: var(--content-width);
        margin: 0 auto;
    }
}
</style>
