<script lang="ts" setup>
const router = useRouter();
const searchQuery = ref('');
const isExpanded = ref(false);

function handleSearch() {
    if (searchQuery.value.trim()) {
        router.push({ path: '/search', query: { q: searchQuery.value.trim() } });
        searchQuery.value = '';
        isExpanded.value = false;
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        handleSearch();
    }
    if (e.key === 'Escape') {
        isExpanded.value = false;
        searchQuery.value = '';
    }
}
</script>

<template>
    <div class="search-bar" :class="{ 'search-bar--expanded': isExpanded }">
        <button
            class="search-bar__toggle"
            @click="isExpanded = !isExpanded"
            aria-label="Toggle search"
        >
            <Icon name="mdi:magnify" />
        </button>
        <input
            v-show="isExpanded"
            v-model="searchQuery"
            type="text"
            class="search-bar__input"
            placeholder="Search manga..."
            @keydown="handleKeydown"
            ref="inputRef"
        />
        <button
            v-show="isExpanded && searchQuery"
            class="search-bar__submit"
            @click="handleSearch"
            aria-label="Submit search"
        >
            <Icon name="mdi:arrow-right" />
        </button>
    </div>
</template>

<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    gap: var(--inner-gap);
}

.search-bar__toggle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    color: var(--foreground);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    transition: background-color var(--default-animation), color var(--default-animation);
}

.search-bar__toggle:hover {
    background-color: var(--background-hover);
    color: var(--primary);
}

.search-bar__input {
    width: 200px;
    padding: 8px 12px;
    background-color: var(--card-background);
    border: 1px solid var(--border);
    border-radius: var(--border-radius);
    color: var(--foreground);
    font-size: 0.875rem;
    outline: none;
    transition: border-color var(--default-animation), width var(--default-animation);
}

.search-bar__input::placeholder {
    color: var(--foreground-muted);
}

.search-bar__input:focus {
    border-color: var(--primary);
}

.search-bar--expanded .search-bar__input {
    width: 250px;
}

.search-bar__submit {
    width: 36px;
    height: 36px;
    border-radius: var(--border-radius);
    background-color: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    transition: background-color var(--default-animation);
}

.search-bar__submit:hover {
    background-color: var(--primary-hover);
}

@media (max-width: 480px) {
    .search-bar--expanded .search-bar__input {
        width: 160px;
    }
}
</style>
