<script setup>
import { inject, provide } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ username: 'user1', demo: null }];

const columnDefs = [
    {
        headerName: 'Username',
        field: 'username',
        flex: 1,
    },
    {
        headerName: 'Demo',
        field: 'demo',
        flex: 3,
        cellRenderer: 'DemoRenderer',
    },
];

const gridOptions = {
    columnDefs,
};

const dateInDemoTable = new Date().toUTCString();
const state = { lastLoaded: dateInDemoTable };

const someValue = inject('someValue');
provide('state', state);
</script>

<template>
    <p>
        Time in DemoTable: <span id="table-timestamp">{{ dateInDemoTable }}</span> {{ someValue }}
    </p>
    <AgGridVue :grid-options="gridOptions" :row-data="rowData" class="ag-theme-alpine demo-table" theme="legacy" />
</template>

<style scoped>
.demo-table {
    height: 300px;
}
</style>
