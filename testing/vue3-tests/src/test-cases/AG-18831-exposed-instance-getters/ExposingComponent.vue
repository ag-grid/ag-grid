<template>
    <span>{{ label }}</span>
</template>

<script setup>
const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const label = props.params.label ?? props.params.data?.id ?? props.params.value;

const exposedFunction = () => `exposed:${label}`;

defineExpose({ exposedFunction, getValue: () => props.params.value });
</script>
