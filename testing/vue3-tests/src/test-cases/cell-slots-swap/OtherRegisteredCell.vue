<script>
let mountCount = 0;
</script>

<script setup>
defineProps({
    params: {
        type: Object,
        required: true,
    },
});

mountCount++;
const thisMountCount = mountCount;
</script>

<template>
    <span data-testid="other-cell" :data-mount-count="thisMountCount">Other:{{ params.value }}</span>
</template>
