<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue';

import type { ICellEditorParams } from 'ag-grid-community';

const props = defineProps<{ params: ICellEditorParams }>();

const input = useTemplateRef('my-input');

const getInitialValue = () => {
    let startValue = props.params.value;

    const eventKey = props.params.eventKey;
    const isBackspace = eventKey === 'Backspace';

    if (isBackspace) {
        startValue = '';
    } else if (eventKey && eventKey.length === 1) {
        startValue = eventKey;
    }

    if (startValue !== null && startValue !== undefined) {
        return startValue;
    }
};

const value = ref(getInitialValue());

const getValue = () => {
    return value.value;
};

onMounted(() => {
    nextTick(() => {
        input.value!.focus();
    });
});

defineExpose({
    getValue,
});
</script>

<template>
    <span class="imgSpan">
        <input ref="my-input" v-model="value" class="my-simple-editor" />
    </span>
</template>

<style>
.my-simple-editor {
    box-sizing: border-box;
    padding-left: var(--ag-grid-size);
    width: 100%;
    height: 100%;
}
</style>
