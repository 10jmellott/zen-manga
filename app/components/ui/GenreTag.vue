<script lang="ts" setup>
import type { Tag } from '~/types/mangadex';
import { getEnglishTitle } from '~/utils/api/mangadex';

interface Props {
    tag: Tag;
    size?: 'small' | 'medium';
    clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
    clickable: true,
});

const name = computed(() => getEnglishTitle([props.tag.attributes.name]));
</script>

<template>
    <NuxtLink
        v-if="clickable"
        :to="`/genre/${tag.id}`"
        class="genre-tag"
        :class="`genre-tag--${size}`"
    >
        {{ name }}
    </NuxtLink>
    <span v-else class="genre-tag" :class="`genre-tag--${size}`">
        {{ name }}
    </span>
</template>

<style scoped>
.genre-tag {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    background-color: var(--secondary);
    color: var(--foreground);
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color var(--default-animation), color var(--default-animation);
    text-decoration: none;
    white-space: nowrap;
}

.genre-tag:hover {
    background-color: var(--primary);
    color: white;
}

.genre-tag--small {
    padding: 4px 10px;
    font-size: 0.75rem;
}
</style>
