<script setup>
import { h } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ price: 9.99 }];

const TypeRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'type-renderer' }, `TYPE:${this.params.value}`);
    },
};

// defaultColDef and columnTypes are supplied only via gridOptions here, not as separate props,
// and defaultColDef supplies the type rather than the column itself.
const gridOptions = {
    columnTypes: {
        currency: { cellRenderer: TypeRenderer },
    },
    defaultColDef: {
        type: 'currency',
    },
    columnDefs: [{ headerName: 'Price', field: 'price' }],
};
</script>

<template>
    <AgGridVue
        :grid-options="gridOptions"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #cell-price="params">
            <span data-testid="slot-should-not-render">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
