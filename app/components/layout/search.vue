<script lang="ts" setup>
import type { MangaTag } from "~/types/manga";

const mangaStore = useMangaStore();

const searchQuery = ref('');
const filtersOpen = ref(false);
const tags = await fetchTags();
// group tags by their group
const groupedTags = computed(() => {
	const groups: Record<string, MangaTag[]> = {};
	tags.forEach(tag => {
		if (!groups[tag.group]) {
			groups[tag.group] = [];
		}
		groups[tag.group]!.push(tag);
	});
	return groups;
});
const includedTags = ref<MangaTag[]>([]);
const excludedTags = ref<MangaTag[]>([]);
function toggleTag(tag: MangaTag) {
	if (includedTags.value.some(t => t.id === tag.id)) {
		includedTags.value = includedTags.value.filter(t => t.id !== tag.id);
		excludedTags.value.push(tag);
	} else if (excludedTags.value.some(t => t.id === tag.id)) {
		excludedTags.value = excludedTags.value.filter(t => t.id !== tag.id);
	} else {
		includedTags.value.push(tag);
	}
}
function isTagIncluded(tag: MangaTag) {
	return includedTags.value.some(t => t.id === tag.id);
}
function isTagExcluded(tag: MangaTag) {
	return excludedTags.value.some(t => t.id === tag.id);
}

function clearFilters() {
	searchQuery.value = '';
	includedTags.value = [];
	excludedTags.value = [];
}

// On search query or tag change, perform search
watch([searchQuery, includedTags, excludedTags], async () => {
	mangaStore.searchManga(searchQuery.value, includedTags.value, excludedTags.value);
}, { deep: true });
</script>

<template>
	<div class="search">
		<div class="search-bar">
			<input type="text" placeholder="Search..." class="search-input" v-model="searchQuery" />
			<Icon name="mdi:close" v-show="mangaStore.searchResults" @click="clearFilters" />
			<span class="filter-toggle" :data-count="includedTags.length + excludedTags.length">
				<Icon name="mdi:filter" @click="filtersOpen = !filtersOpen" />
			</span>
		</div>
		<div v-if="filtersOpen" class="filter card">
			<div class="tag-group" v-for="(groupTags, group) in groupedTags" :key="group">
				<h4 class="h4">{{ group }}</h4>
				<span class="tag" v-for="tag in groupTags" :key="tag.name" @click="toggleTag(tag)" :class="{
					included: isTagIncluded(tag),
					excluded: isTagExcluded(tag)
				}">
					{{ tag.name }}
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.search {
	display: flex;
	flex-direction: column;
	gap: var(--spacing);
}

.search-bar {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: var(--padding);
	gap: var(--spacing);
	font-size: 2rem;
}

.search-input {
	width: 100%;
	padding: var(--padding) 0;
	background: var(--background);
	border: none;
	border-bottom: 1px solid var(--accent);
	outline: none;
	transition: border-color 0.3s ease;
	font-size: 1.25rem;

	&:focus {
		border-color: var(--primary);
	}
}

.filter-toggle {
	position: relative;

	&::after {
		content: attr(data-count);
		position: absolute;
		top: -12px;
		right: -12px;
		height: 24px;
		width: 24px;
		background-color: var(--card-background);
		backdrop-filter: blur(4px);
		color: var(--foreground);
		border-radius: 50%;
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.filter-toggle[data-count="0"]::after {
	display: none;
}

.filter {
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	padding: var(--spacing);
	gap: var(--spacing);
}

.tag-group {
	display: flex;
	gap: var(--padding);
	flex-wrap: wrap;

	h4 {
		color: var(--primary);
		font-weight: bold;
	}
}

.tag {
	padding: 2px 6px;
	border-radius: var(--border-radius);
	font-size: 0.8rem;
	text-transform: lowercase;
	cursor: pointer;
	white-space: nowrap;

	&.included {
		background-color: var(--muted-teal);
		color: var(--background);
	}

	&.excluded {
		background-color: var(--burnt-peach);
		color: var(--background);
	}
}
</style>