<script setup>
import { AgGridVue } from 'ag-grid-vue3';

const rowData = [{ label: 'Alpha' }, { label: 'Beta' }];

const columnDefs = [{ headerName: 'Label', field: 'label' }];
</script>

<template>
    <AgGridVue
        :column-defs="columnDefs"
        :row-data="rowData"
        class="ag-theme-alpine"
        theme="legacy"
        style="height: 200px"
    >
        <template #cell-label="params"
            >Note: <strong data-testid="multi-root-strong">{{ params.value }}</strong>
            <em data-testid="multi-root-em">!</em></template
        >
    </AgGridVue>
</template>
