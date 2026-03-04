<template>
    <input id="goldeditor" v-model="value" />
</template>

<script setup>
import { ref } from 'vue';

defineOptions({
    name: 'CustomCellEditorScriptSetup',
});

const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const value = ref(props.params.value);

const getValue = () => {
    return Number(value.value * 2);
};

const isCancelBeforeStart = () => {
    return false;
};

const isCancelAfterEnd = () => {
    return false;
};

defineExpose({
    getValue,
    isCancelBeforeStart,
    isCancelAfterEnd,
});
</script>
