<script setup>
import { inject } from 'vue';

const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const someValue = inject('someValue');
const state = inject('state');
</script>

<template>
    <p style="display: inline">
        <span id="grid-cell-renderer">{{ state.lastLoaded }}</span> <span>{{ someValue }}</span>
    </p>
</template>
