<script setup>
// Verifies explicit-null clearing is resolved per-property: nulling cellRenderer clears an
// inherited defaultColDef renderer for its own column, but nulling only cellRendererSelector on a
// different column must not also clear that column's separately-inherited cellRenderer. Also
// verifies an explicit `cellRenderer: undefined` is not treated as clearing it (unlike null).
import { h } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ total: 100, qty: 3, amount: 50 }];

const DefaultRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'default-renderer' }, `DEFAULT:${this.params.value}`);
    },
};

const defaultColDef = { cellRenderer: DefaultRenderer };
const columnDefs = [
    { headerName: 'Total', field: 'total', cellRenderer: null },
    { headerName: 'Qty', field: 'qty', cellRendererSelector: null },
    { headerName: 'Amount', field: 'amount', cellRenderer: undefined },
];
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
            <span data-testid="slot-cell-total">SLOT:{{ params.value }}</span>
        </template>
        <template #cell-qty="params">
            <span data-testid="slot-cell-qty">SLOT:{{ params.value }}</span>
        </template>
        <template #cell-amount="params">
            <span data-testid="slot-cell-amount">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
