<template>
    <ag-grid-vue
        style="width: 100%; height: 500px"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        :rowData="rowData"
        theme="legacy"
        @cell-clicked="onCellClicked"
    />
</template>

<script setup>
import { reactive, ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const columnDefs = ref([{ field: 'value' }]);
const rowData = reactive([{ value: 2 }]);

const onCellClicked = () => {
    rowData.push({ value: Math.floor(Math.random() * 10) + 3 });
};
</script>
