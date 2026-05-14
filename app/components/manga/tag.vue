<script lang="ts" setup>
const props = defineProps<{
	tag: string;
}>();
const color = computed(() => {
	switch (props.tag) {
		case 'ongoing':
			return 'var(--apricot-cream)';
		case 'safe':
		case 'completed':
			return 'var(--muted-teal)';
		case 'mature':
		case 'erotica':
		case 'cancelled':
		case 'hiatus':
			return 'var(--burnt-peach)';
		default:
			return 'var(--foreground)';
	}
});
</script>

<template>
	<span class="caption2" :style="{ color: color }">{{ props.tag }}</span>
</template>

<style scoped>
span {
	text-align: center;
	padding: 2px 6px;
	border: 1px solid var(--background);
	border-radius: var(--border-radius);
	font-size: 10px;
	text-transform: lowercase;
}
</style>
