<script setup>
defineProps({
    params: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <span data-testid="registered-cell">REGISTERED:{{ params.value }}</span>
</template>
