<template>
    <div style="margin-top: 10px">
        <div>Headers should render with a custom header component - with a star and name</div>
        <ag-grid-vue
            :columnDefs="columnDefs"
            :rowData="rows"
            :defaultColDef="defaultColDef"
            class="ag-theme-alpine"
            style="flex: 1 1 auto; height: 500px"
            theme="legacy"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

import HeaderComponent from './HeaderComponent.vue';

const convertToColDef = (columnName, index) => {
    return {
        headerComponent: HeaderComponent,
        headerName: columnName,
        colId: `${index}`,
        field: columnName,
    };
};

const columnDefs = ref(['athlete', 'age'].map((columnName, index) => convertToColDef(columnName, index)));

const rows = ref([
    {
        athlete: 'Michael Phelps',
        age: 23,
        country: 'United States',
        year: 2008,
        date: '24/08/2008',
        sport: 'Swimming',
        gold: 8,
        silver: 0,
        bronze: 0,
        total: 8,
    },
]);

const defaultColDef = { flex: 1 };
</script>
