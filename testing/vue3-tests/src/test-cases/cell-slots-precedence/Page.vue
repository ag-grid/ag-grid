<script setup>
import { h } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ price: 9.99, total: 100 }];

const TypeRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'type-renderer' }, `TYPE:${this.params.value}`);
    },
};

const DefaultRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'default-renderer' }, `DEFAULT:${this.params.value}`);
    },
};

const columnTypes = {
    currency: { cellRenderer: TypeRenderer },
};

const defaultColDef = {
    cellRenderer: DefaultRenderer,
};

const columnDefs = [
    { headerName: 'Price', field: 'price', type: 'currency' },
    { headerName: 'Total', field: 'total' },
];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        :column-types="columnTypes"
        :default-col-def="defaultColDef"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #cell-price="params">
            <span data-testid="slot-should-not-render">SLOT:{{ params.value }}</span>
        </template>
        <template #cell-total="params">
            <span data-testid="slot-should-not-render">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
