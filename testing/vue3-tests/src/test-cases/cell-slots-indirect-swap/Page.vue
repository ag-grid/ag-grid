<script setup>
// Verifies a slot swap is picked up when the column reaches the slot indirectly - via a
// `components` alias, and via a `cellRendererSelector` result - not just a literal
// colDef.cellRenderer match.
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const showBefore = ref(true);
const rowData = [{ value: 42 }];
const components = { aliasName: 'aliasSlot' };
const columnDefs = [
    { headerName: 'Alias', field: 'value', colId: 'alias', cellRenderer: 'aliasName' },
    {
        headerName: 'Selector',
        field: 'value',
        colId: 'selector',
        cellRendererSelector: () => ({ component: 'selectorSlot' }),
    },
];

function toggle() {
    showBefore.value = !showBefore.value;
}
</script>

<template>
    <div>
        <button id="toggle" type="button" @click="toggle">Toggle</button>
        <AgGridVue
            :column-defs="columnDefs"
            :row-data="rowData"
            :components="components"
            class="ag-theme-alpine"
            theme="legacy"
            style="height: 200px"
        >
            <template v-if="showBefore" #aliasSlot="params">Before:{{ params.value }}</template>
            <template v-else #aliasSlot="params">After:{{ params.value }}</template>
            <template v-if="showBefore" #selectorSlot="params">Before:{{ params.value }}</template>
            <template v-else #selectorSlot="params">After:{{ params.value }}</template>
        </AgGridVue>
    </div>
</template>
