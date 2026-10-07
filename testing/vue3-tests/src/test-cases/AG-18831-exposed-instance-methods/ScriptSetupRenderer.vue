<template>
    <span>{{ props.params.value }}</span>
</template>

<script setup>
const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const exposedFunction = () => `script-setup:${props.params.value}`;

defineExpose({ exposedFunction });
</script>
