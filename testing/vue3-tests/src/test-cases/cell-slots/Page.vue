<script setup>
import { AgGridVue } from 'ag-grid-vue3';

const rowData = [
    { name: 'Widget', price: 9.99 },
    { name: 'Gadget', price: 19.5 },
    { name: 'Gizmo', price: 100 },
];

const columnDefs = [
    { headerName: 'Name', field: 'name' },
    { headerName: 'Price', field: 'price' },
];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 300px"
    >
        <template #cell-price="params">
            <span class="slot-cell" data-testid="slot-cell">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
