<template>
    <button id="check-instances" @click="checkInstances">Check instances</button>
    <ul>
        <li v-for="result in results" :key="result.id" :id="`result-${result.id}`">{{ result.text }}</li>
    </ul>
    <ag-grid-vue
        :style="{ height: '400px', width: '100%' }"
        :column-defs="columnDefs"
        :row-data="rowData"
        :get-row-id="getRowId"
        :is-full-width-row="isFullWidthRow"
        :full-width-cell-renderer="ExposingComponent"
        :status-bar="statusBar"
        :side-bar="sideBar"
        :enable-filter-handlers="true"
        @grid-ready="onGridReady"
    />
</template>

<script setup>
import { isProxy, ref, shallowRef } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

import ExposingComponent from './ExposingComponent.vue';

const columnDefs = ref([
    {
        field: 'value',
        editable: true,
        cellEditor: ExposingComponent,
        filter: { component: ExposingComponent, doesFilterPass: () => true },
    },
]);

const rowData = ref([
    { id: 'cell', value: 'cell' },
    { id: 'full-width', value: 'full-width' },
]);

const getRowId = (params) => params.data.id;
const isFullWidthRow = (params) => params.rowNode.data.id === 'full-width';

const statusBar = {
    statusPanels: [{ statusPanel: ExposingComponent, key: 'exposing', statusPanelParams: { label: 'status-panel' } }],
};

const sideBar = {
    toolPanels: [
        {
            id: 'exposing',
            labelDefault: 'Exposing',
            labelKey: 'exposing',
            iconKey: 'columns',
            toolPanel: ExposingComponent,
            toolPanelParams: { label: 'tool-panel' },
        },
    ],
    defaultToolPanel: 'exposing',
};

const gridApi = shallowRef(null);
const results = ref([]);

const onGridReady = (params) => {
    gridApi.value = params.api;
};

const describe = (id, instance) => {
    const found = typeof instance?.exposedFunction === 'function';
    return { id, text: found ? `found:${instance.exposedFunction()}` : 'not-found' };
};

const checkInstances = async () => {
    const api = gridApi.value;

    const [fullWidth] = api.getCellRendererInstances({ rowNodes: [api.getRowNode('full-width')] });
    const filter = await api.getColumnFilterInstance('value');
    const statusPanel = api.getStatusPanel('exposing');
    const toolPanel = api.getToolPanelInstance('exposing');

    api.startEditingCell({ rowIndex: 0, colKey: 'value' });
    await new Promise((resolve) => setTimeout(resolve));
    const [editor] = api.getCellEditorInstances();
    const editorResult = describe('cell-editor', editor);
    api.stopEditing(true);

    results.value = [
        describe('full-width', fullWidth),
        editorResult,
        describe('filter', filter),
        describe('status-panel', statusPanel),
        describe('tool-panel', toolPanel),
        {
            id: 'identity',
            text: String(
                api.getStatusPanel('exposing') === statusPanel &&
                    ref(statusPanel).value === statusPanel &&
                    !isProxy(ref(statusPanel).value)
            ),
        },
    ];
};
</script>
