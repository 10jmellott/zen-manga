<script lang="ts" setup>
const route = useRoute();
const isReaderPage = computed(() => route.path.includes('/chapter/'));
</script>

<template>
  <div class="app">
    <LayoutHeader v-if="!isReaderPage" class="app__header" />
    <main class="app__main" :class="{ 'app__main--reader': isReaderPage }">
      <NuxtPage class="app__content" :class="{ 'app__content--reader': isReaderPage }" />
    </main>
    <LayoutNavigation v-if="!isReaderPage" class="app__navigation" />
  </div>
</template>

<style>
/* Global styles for the app */
@import '@/assets/styles/reset.css';
@import '@/assets/styles/colors.css';
@import '@/assets/styles/theme.css';
@import '@/assets/styles/typography.css';
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
	position: relative;
}

.app__content {
  max-width: var(--content-width);
  margin: 0 auto;
}

.app__content--reader {
  max-width: none;
  margin: 0;
}

.app__main {
  flex: 1;
  padding: var(--fullscreen-padding);
}

.app__main--reader {
  padding: 0;
}
</style>
