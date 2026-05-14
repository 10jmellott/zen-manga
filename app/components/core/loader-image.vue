<script lang="ts" setup>
defineProps<{
	src: string;
}>();
const loaded = ref(false);
const error = ref(false);

// Data might have started loading, hide the loader after 6 seconds
// to prevent it from being stuck indefinitely
setTimeout(() => {
	loaded.value = true;
}, 6000);
</script>

<template>
	<div :class="{ loaded }">
		<CoreLoader class="loader" v-if="!loaded && !error" />
		<span v-else-if="error">Failed to load image</span>
		<img v-if="!error" :src="src" @load="loaded = true" @error="error = true" />
	</div>
</template>

<style scoped>
div {
	position: relative;
	aspect-ratio: 5 / 7;

	&.loaded {
		display: block;
		aspect-ratio: auto;
	}
}
img {
	display: block;
	width: 100%;
	height: auto;
	z-index: 1000000;
}
.loader {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
span {
	display: block;
	color: red;
	text-align: center;
	font-size: 14px;
}
</style>
