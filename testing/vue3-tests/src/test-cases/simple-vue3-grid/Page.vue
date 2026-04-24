<template>
    <div>1 rows should render with the price having custom pound icon renderer</div>
    <div>when the button is clicked new row should be added</div>
    <div>the json below the table should match the row data (except for price which will be a number in the json)</div>
    <div style="height: 500px; box-sizing: border-box">
        <button role="button" @click="onClick">click</button>
        <ag-grid-vue
            :columnDefs="columnDefs"
            :rowData="rowData"
            :rowSelection="{
                mode: 'singleRow',
                checkboxes: false,
                enableClickSelection: true,
            }"
            style="height: 500px; width: 500px"
            theme="legacy"
            class="ag-theme-quartz"
            @grid-ready="gridReady"
            @cell-clicked="rowSelected"
        />
        {{ rowData }}
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import PriceRenderer from './PriceRenderer.vue';
import SimpleEditor from './SimpleEditor.vue';

const rowData = ref<any[]>([{ make: 'Tesla', model: 'Model Y', price: 64950, electric: true }]);

const columnDefs = ref<ColDef[]>([
    { field: 'make', editable: true, cellEditor: 'SimpleEditor' },
    { field: 'model', editable: true },
    { field: 'price', editable: true, cellRenderer: 'PriceRenderer' },
]);

const onClick = () => {
    rowData.value.push({ make: 'Wibble', model: 'Wobble', price: 20500, electric: true });
};

const rowSelected = () => {
    console.log('cell selected');
};

const gridReady = () => {
    console.log('grid ready');
};

defineExpose({
    PriceRenderer,
    SimpleEditor,
});
</script>
