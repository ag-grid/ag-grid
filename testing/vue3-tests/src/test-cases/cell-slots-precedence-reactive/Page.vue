<script setup>
import { h, ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ total: 100 }];

const DefaultRenderer = {
    props: ['params'],
    render() {
        return h('span', { 'data-testid': 'default-renderer' }, `DEFAULT:${this.params.value}`);
    },
};

const columnDefs = [{ headerName: 'Total', field: 'total' }];

// Starts with no cellRenderer, so the slot renders until a button flips it reactively.
const defaultColDef = ref({});

function addDefaultRenderer() {
    defaultColDef.value = { cellRenderer: DefaultRenderer };
}
function removeDefaultRenderer() {
    defaultColDef.value = {};
}
</script>

<template>
    <div>
        <button id="add-default-renderer" type="button" @click="addDefaultRenderer">Add Default Renderer</button>
        <button id="remove-default-renderer" type="button" @click="removeDefaultRenderer">
            Remove Default Renderer
        </button>
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
    </div>
</template>
