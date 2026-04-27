<template>
    <div>Custom header with menu and filter icon should render</div>
    <ag-grid-vue
        :rowData="rowData"
        :columnDefs="colDefs"
        style="height: 500px"
        class="ag-theme-quartz"
        column-menu="new"
        theme="legacy"
    />
</template>

<script setup>
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

import MaColumnHeader from './MaColumnHeader.vue';

const rowData = ref([
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
]);

const colDefs = ref([
    {
        field: 'make',
        headerComponent: MaColumnHeader,
        filter: 'agTextColumnFilter',
        flex: 1,
    },
    { field: 'model' },
    { field: 'price' },
    { field: 'electric' },
]);
</script>
