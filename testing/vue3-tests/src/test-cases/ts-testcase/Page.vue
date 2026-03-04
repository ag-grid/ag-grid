<script lang="ts" setup>
import { ref, shallowRef } from 'vue';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

type ROW_TYPE = any;

const gridApi = shallowRef<GridApi | null>(null);
const columnDefs = ref<ColDef<ROW_TYPE>[]>([
    { field: 'athlete', minWidth: 150 },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
]);

const defaultColDef = ref<ColDef>({
    flex: 1,
    minWidth: 100,
});
const rowData = ref<unknown[] | null>(null);

const onGridReady = (params: GridReadyEvent) => {
    gridApi.value = params.api;

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => (rowData.value = data));
};
</script>

<template>
    <div style="height: 300px">
        <AgGridVue
            style="width: 100%; height: 100%"
            theme="legacy"
            class="ag-theme-quartz"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColDef"
            :rowData="rowData"
            @grid-ready="onGridReady"
        />
    </div>
</template>
