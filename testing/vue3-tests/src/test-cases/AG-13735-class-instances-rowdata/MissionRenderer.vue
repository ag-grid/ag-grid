<template>
    {{ cellValue }}
</template>

<script setup>
const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const cellValue = props.params.value.getName();
</script>
