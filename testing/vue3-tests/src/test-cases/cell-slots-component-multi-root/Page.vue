<script setup>
// Verifies a slot whose single root is itself a multi-root component is not treated as a safe
// single element — every DOM root the component produces must survive, not just the first.
import { h } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const MultiRootComponent = {
    props: ['params'],
    render() {
        return [
            h('strong', { 'data-testid': 'component-root-a' }, `A:${this.params.value}`),
            h('em', { 'data-testid': 'component-root-b' }, `B:${this.params.value}`),
        ];
    },
};

const rowData = [{ value: 7 }];
const columnDefs = [{ headerName: 'Value', field: 'value', cellRenderer: 'multiRootComponentCell' }];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #multiRootComponentCell="params">
            <MultiRootComponent :params="params" />
        </template>
    </AgGridVue>
</template>
