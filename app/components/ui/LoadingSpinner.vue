<script lang="ts" setup>
interface Props {
    size?: 'small' | 'medium' | 'large';
}

withDefaults(defineProps<Props>(), {
    size: 'medium',
});
</script>

<template>
    <div class="loading-spinner" :class="`loading-spinner--${size}`">
        <div class="loading-spinner__circle"></div>
    </div>
</template>

<style scoped>
.loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner--small {
    width: 24px;
    height: 24px}

.loading-spinner--medium {
    width: 40px;
    height: 40px;
}

.loading-spinner--large {
    width: 60px;
    height: 60px;
}

.loading-spinner__circle {
    width: 100%;
    height: 100%;
    border: 3px solid var(--secondary);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.loading-spinner--small .loading-spinner__circle {
    border-width: 2px;
}

.loading-spinner--large .loading-spinner__circle {
    border-width: 4px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
