<script lang="ts" setup>
const mangaStore = useMangaStore();
</script>

<template>
    <div>
		<h2>Continue Reading</h2>
		<div v-for="manga in mangaStore.continueReading" :key="manga.id">
			{{ manga.title }}
		</div>
		<h2>Last Updated</h2>
		<div v-for="manga in mangaStore.lastUpdated" :key="manga.id">
			{{ manga.title }}
		</div>
	</div>
</template>
