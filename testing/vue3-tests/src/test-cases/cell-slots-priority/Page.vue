<script setup>
// Verifies a named slot on this AgGridVue takes priority over a globally-registered component
// sharing the same cellRenderer string name.
import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ value: 42 }];

const columnDefs = [{ headerName: 'Value', field: 'value', cellRenderer: 'PrioritySharedCell' }];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #PrioritySharedCell="params">
            <span data-testid="slot-cell">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
