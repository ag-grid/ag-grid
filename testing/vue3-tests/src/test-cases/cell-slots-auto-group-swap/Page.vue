<script setup>
// Verifies a slot swap is picked up on a generated auto-group column, not just a user-defined
// column - getColumnDefs() excludes generated columns, so refresh targeting must read live columns.
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const showBefore = ref(true);
const rowData = [{ group: 'A' }];
const columnDefs = [{ field: 'group', rowGroup: true, hide: true }];
const autoGroupColumnDef = { cellRenderer: 'groupSlot' };

function toggle() {
    showBefore.value = !showBefore.value;
}
</script>

<template>
    <div>
        <button id="toggle" type="button" @click="toggle">Toggle</button>
        <AgGridVue
            :column-defs="columnDefs"
            :auto-group-column-def="autoGroupColumnDef"
            :row-data="rowData"
            :group-default-expanded="-1"
            class="ag-theme-alpine"
            theme="legacy"
            style="height: 200px"
        >
            <template v-if="showBefore" #groupSlot="params">Before:{{ params.value }}</template>
            <template v-else #groupSlot="params">After:{{ params.value }}</template>
        </AgGridVue>
    </div>
</template>
