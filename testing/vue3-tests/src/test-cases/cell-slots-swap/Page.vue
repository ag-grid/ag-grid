<script setup>
// Verifies a cell whose cellRenderer resolves to a slot picks up a v-if/v-else swap between two
// differently-named templates for the same slot, instead of staying stuck on the earlier content.
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const showBefore = ref(true);
const rowData = [{ value: 42 }];
const columnDefs = [{ headerName: 'Value', field: 'value', cellRenderer: 'swapCell' }];

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
            class="ag-theme-alpine"
            theme="legacy"
            style="height: 200px"
        >
            <template v-if="showBefore" #swapCell="params">Before:{{ params.value }}</template>
            <template v-else #swapCell="params">After:{{ params.value }}</template>
        </AgGridVue>
    </div>
</template>
