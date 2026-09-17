<script setup>
// Verifies a column type resolved from a comma-separated, untrimmed type list still matches its columnTypes renderer.
import { h } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ qty: 3 }];

const TypeRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'type-renderer' }, `TYPE:${this.params.value}`);
    },
};

const columnTypes = {
    currency: { cellRenderer: TypeRenderer },
};

// Space after the comma: the column type list core resolves against columnTypes is trimmed,
// and this must match that behaviour rather than looking up ' currency' verbatim.
const columnDefs = [{ headerName: 'Qty', field: 'qty', type: 'numericColumn, currency' }];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        :column-types="columnTypes"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #cell-qty="params">
            <span data-testid="slot-should-not-render">SLOT:{{ params.value }}</span>
        </template>
    </AgGridVue>
</template>
