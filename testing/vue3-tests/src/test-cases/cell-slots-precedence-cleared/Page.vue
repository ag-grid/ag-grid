<script setup>
// Verifies an explicit `cellRenderer: null` on a column clears an inherited defaultColDef renderer, letting its slot apply.
import { h } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ total: 100 }];

const DefaultRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'default-renderer' }, `DEFAULT:${this.params.value}`);
    },
};

const defaultColDef = { cellRenderer: DefaultRenderer };
const columnDefs = [{ headerName: 'Total', field: 'total', cellRenderer: null }];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        :default-col-def="defaultColDef"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #cell-total="params">
            <span data-testid="slot-cell">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
