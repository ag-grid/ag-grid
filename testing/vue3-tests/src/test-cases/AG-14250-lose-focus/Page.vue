<template>
    <ag-grid-vue
        style="width: 100%; height: 100%"
        class="ag-theme-alpine"
        theme="legacy"
        @grid-ready="onGridReady"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        v-model="rowData"
    >
    </ag-grid-vue>
</template>

<script setup>
import { ref, shallowRef } from 'vue';

import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([NumberEditorModule, TextEditorModule, ClientSideRowModelModule, ValidationModule]);

const gridApi = shallowRef(null);
const columnDefs = ref([
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'total' },
]);
const defaultColDef = ref({
    editable: true,
});
const rowData = ref(null);

const onGridReady = (params) => {
    gridApi.value = params.api;

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => {
            rowData.value = data.slice(0, 20);
        });
};
</script>
