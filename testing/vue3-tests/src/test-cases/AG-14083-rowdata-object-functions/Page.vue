<template>
    <ag-grid-vue
        :columnDefs="colDefs"
        :rowData="rowData"
        style="width: 100%; height: 500px"
        class="ag-theme-quartz"
        theme="legacy"
    />
</template>

<script lang="ts" setup>
import Decimal from 'decimal.js';
import { onMounted, ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

const rowData = ref<any[]>([]);

onMounted(async () => {
    rowData.value = [{ decimal: new Decimal('1') }];
});

const colDefs = ref<ColDef[]>([
    {
        field: 'decimal',
        width: 150,
        valueFormatter: (params) => params.value.toNumber(),
    },
]);
</script>
