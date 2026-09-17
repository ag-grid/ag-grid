<script setup>
import { ref } from 'vue';

const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const value = ref(props.params.value);

defineExpose({
    getValue: () => value.value,
});
</script>

<template>
    <input data-testid="real-editor" v-model="value" />
</template>
