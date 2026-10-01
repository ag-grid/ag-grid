<script setup>
// Verifies a slot named the same as a registered cellEditor does not hijack the editor role —
// slot resolution is scoped to cellRenderer, so the real, registered editor must still be used.
import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ value: 'abc' }];
const columnDefs = [{ headerName: 'Value', field: 'value', editable: true, cellEditor: 'EditorAndSlotName' }];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #EditorAndSlotName="params">
            <span data-testid="slot-should-not-be-used">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
