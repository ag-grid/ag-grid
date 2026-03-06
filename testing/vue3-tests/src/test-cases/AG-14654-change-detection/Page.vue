<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import type { ColDef, GetRowIdParams, GridReadyEvent } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

interface ICar {
    make: string;
    model: string;
    price: number;
}

const columnDefs = ref<ColDef[]>([{ field: 'make' }, { field: 'price' }]);

const rowData = ref<ICar[]>([
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Aston Martin', model: 'DBX', price: 190000 },
]);

function getRowId(params: GetRowIdParams<ICar>) {
    return `${params.data.make}:${params.data.model}`;
}

const onGridReady = (params: GridReadyEvent) => {
    setInterval(() => {
        rowData.value[0].price = Math.round(Math.random() * 100000);
    }, 200);
};
</script>

<template>
    <ag-grid-vue
        style="width: 500px; height: 400px"
        class="ag-theme-quartz"
        theme="legacy"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :getRowId="getRowId"
        @grid-ready="onGridReady"
    />
</template>
