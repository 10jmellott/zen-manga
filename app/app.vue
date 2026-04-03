<template>
  <div class="app">
    <LayoutHeader class="app__header" />
    <main class="app__main">
      <NuxtPage class="app__content" />
    </main>
	<LayoutNavigation class="app__navigation" />
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
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__content {
  max-width: var(--content-width);
  margin: 0 auto;
}

.app__main {
  flex: 1;
  padding: var(--fullscreen-padding);
}
</style>
