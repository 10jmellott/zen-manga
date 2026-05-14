<script lang="ts" setup>
const layoutStore = useLayoutStore();
</script>

<template>
	<div class="app">
		<LayoutHeader class="header" :class="{ visible: layoutStore.showHeader }" />
		<main class="content" :class="{ padded: layoutStore.addContentPadding }">
			<NuxtPage />
		</main>
		<LayoutNavigation class="navigation"  :class="{ visible: layoutStore.showNavigation }" />
	</div>
</template>

<style>
/* Global styles for the app */
@import '@/assets/styles/reset.css';
@import '@/assets/styles/theme.css';
@import '@/assets/styles/typography.css';
</style>

<style scoped>
.app {
	position: relative;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}
.content {
	max-width: var(--content-width);
	flex-grow: 1;
	margin: 0 auto;
	width: 100%;
}
.padded {
	margin: var(--padding);
	width: calc(100% - var(--padding) * 2);
}
.header,
.navigation {
	position: sticky;
	z-index: 5;
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
}
.header {
	top: 0;
}
.navigation {
	bottom: 0;
}
.visible {
	opacity: 1;
	pointer-events: all;
}
</style>
