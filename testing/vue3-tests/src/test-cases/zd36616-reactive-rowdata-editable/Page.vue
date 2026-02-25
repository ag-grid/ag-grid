<template>
    <ag-grid-vue
        v-model="rowData"
        style="width: 100%; height: 500px"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        theme="legacy"
    />
    <span aria-label="value">{{ rowData[0].value }}</span>
</template>

<script setup>
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const columnDefs = ref([{ field: 'value', editable: true }]);
const rowData = ref([{ value: 2 }]);
</script>
