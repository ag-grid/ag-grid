<template>
    <div>Edit cell value - new value should be double the value entered</div>
    <ag-grid-vue
        v-if="isVisible"
        :style="{
            height: '90vh',
            width: '100%',
        }"
        class="ag-theme-quartz"
        :default-col-def="defaultColDef"
        :column-defs="columnDefs"
        :row-data="rowData"
        :initial-state="initialState"
        theme="legacy"
        @grid-ready="onGridReady"
        @state-updated="onStateUpdated"
        @cell-value-changed="onCellValueChanged"
    />
</template>

<script setup>
import { ref, watch } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

import CustomCellEditorScriptSetup from './CustomCellEditorScriptSetup.vue';

const defaultColDef = ref({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    editable: true,
});

const columnDefs = ref([
    {
        field: 'gold',
        cellEditor: CustomCellEditorScriptSetup,
    },
]);

const rowData = ref([
    {
        athlete: 'Michael Phelps',
        age: 23,
        country: 'United States',
        year: 2008,
        date: '24/08/2008',
        sport: 'Swimming',
        gold: 8,
        silver: 0,
        bronze: 0,
        total: 8,
    },
]);

const gridApi = ref(null);

const onGridReady = (params) => {
    gridApi.value = params.api;
};

const previousState = localStorage.getItem('gridState');
const initialState = ref(previousState ? JSON.parse(previousState) : {});
const tempState = ref({});
const isVisible = ref(true);

const onCellValueChanged = (params) => {
    console.log('onCellValueChanged', params);
};

const onStateUpdated = (params) => {
    tempState.value = params.state;
};

watch(
    () => tempState.value,
    (newVal) => {
        localStorage.setItem('gridState', JSON.stringify(newVal));
    }
);
</script>
