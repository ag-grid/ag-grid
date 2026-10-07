<template>
    <button id="check-instances" @click="checkInstances">Check renderer instances</button>
    <ul>
        <li v-for="result in results" :key="result.id" :id="`result-${result.id}`">{{ result.text }}</li>
    </ul>
    <ag-grid-vue
        :style="{ height: '300px', width: '100%' }"
        :column-defs="columnDefs"
        :row-data="rowData"
        :get-row-id="getRowId"
        @grid-ready="onGridReady"
    />
</template>

<script setup>
import { defineComponent, h, ref, shallowRef } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

import ScriptSetupRenderer from './ScriptSetupRenderer.vue';

const OptionsRenderer = defineComponent({
    props: ['params'],
    methods: {
        exposedFunction() {
            return `options:${this.params.value}`;
        },
    },
    render() {
        return h('span', this.params.value);
    },
});

const SetupExposeRenderer = defineComponent({
    props: ['params'],
    setup(props, { expose }) {
        const exposedFunction = () => `setup-expose:${props.params.value}`;
        expose({ exposedFunction });
        return () => h('span', props.params.value);
    },
});

const renderers = {
    options: OptionsRenderer,
    'setup-expose': SetupExposeRenderer,
    'script-setup': ScriptSetupRenderer,
};

const columnDefs = ref([
    {
        field: 'value',
        cellRendererSelector: (params) => ({ component: renderers[params.data.id] }),
    },
]);

const rowData = ref([
    { id: 'options', value: 1 },
    { id: 'setup-expose', value: 2 },
    { id: 'script-setup', value: 3 },
]);

const getRowId = (params) => params.data.id;

const gridApi = shallowRef(null);
const results = ref([]);

const onGridReady = (params) => {
    gridApi.value = params.api;
};

const checkInstances = () => {
    results.value = rowData.value.map(({ id }) => {
        const [instance] = gridApi.value.getCellRendererInstances({ rowNodes: [gridApi.value.getRowNode(id)] });
        const found = typeof instance?.exposedFunction === 'function';
        return { id, text: found ? `found:${instance.exposedFunction()}` : 'not-found' };
    });
};
</script>
