<script setup>
// Verifies two columns using the same cellRenderer string both render via the single matching slot.
import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ min: 1, max: 10 }];

const columnDefs = [
    { headerName: 'Min', field: 'min', cellRenderer: 'boundCell' },
    { headerName: 'Max', field: 'max', cellRenderer: 'boundCell' },
];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #boundCell="params">
            <span class="bound-cell" data-testid="bound-cell">BOUND:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
