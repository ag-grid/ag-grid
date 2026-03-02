<script setup lang="ts">
import { ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { provideGlobalGridOptions } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

provideGlobalGridOptions({
    theme: 'legacy',
});

const context = ref({});
const columnDefs = ref<Array<ColDef>>([
    { headerName: 'Report Date', field: 'reportDate', filter: true, width: 150 },
    { headerName: 'Location', field: 'updatedLocation', filter: true },
    { headerName: 'Part Number', field: 'partNumber', filter: true },
    { headerName: 'Serial Number', field: 'serialNumber', filter: true },
    { headerName: 'Description', field: 'description', filter: true },
    { headerName: 'Total Hours', field: 'totalHours', filter: true },
    { headerName: 'Name', field: 'name', filter: true },
    { headerName: 'Frequency', field: 'frequency', filter: true },
    { headerName: 'UOM', field: 'uom', filter: true },
    { headerName: 'Remaining', field: 'remaining', filter: true },
    { headerName: 'Remaining UOM', field: 'remainingUom', filter: true },
]);

const items = ref([
    {
        id: 2,
        partNumber: 'Polaris 800 Crew',
        serialNumber: '4XAWH76A8B21706',
        description: 'shipped to WACO',
        totalHours: 2398,
        name: 'GSE- 6 Month Recurring',
        frequency: 6,
        uom: 'MO',
        remaining: 6,
        remainingUom: 'Months',
        location: 'Waco Warehouse GSE',
        updatedLocation: 'AO',
        isArchive: false,
        missingFromReport: false,
        reportDate: '2024-10-20T01:01:02.047',
    },
    {
        id: 3,
        partNumber: 'Polaris 800 Crew',
        serialNumber: '4XAWH76A6B2172298',
        description: '@ ETS',
        totalHours: 2474,
        name: 'GSE- 6 Month Recurring',
        frequency: 6,
        uom: 'MO',
        remaining: 6,
        remainingUom: 'Months',
        location: 'Waco Warehouse GSE',
        updatedLocation: 'EC37B',
        isArchive: false,
        missingFromReport: false,
        reportDate: '2024-10-20T01:01:02.047',
    },
    {
        id: 5,
        partNumber: 'Tronair Electric GPU',
        serialNumber: '115611104',
        description: 'shipped to WACO',
        totalHours: 0,
        name: 'GSE- 6 Month Recurring',
        frequency: 6,
        uom: 'MO',
        remaining: 4,
        remainingUom: 'Months',
        location: 'Waco Warehouse GSE',
        updatedLocation: null,
        isArchive: false,
        missingFromReport: true,
        reportDate: '2024-06-22T23:50:41.667',
    },
    {
        id: 8,
        partNumber: 'Hobart GPU-400',
        serialNumber: '112PS17374',
        description: '@ ETS',
        totalHours: 0,
        name: 'GSE- 6 Month Recurring',
        frequency: 6,
        uom: 'MO',
        remaining: 4,
        remainingUom: 'Months',
        location: 'Waco Warehouse GSE',
        updatedLocation: null,
        isArchive: false,
        missingFromReport: true,
        reportDate: '2024-06-22T23:50:41.667',
    },
    {
        id: 9,
        partNumber: 'Tronair Defuel Cart 07-3000-1921-A3',
        serialNumber: '9300090701',
        description: '@ ETS',
        totalHours: 0,
        name: 'GSE- 6 Month Recurring',
        frequency: 6,
        uom: 'MO',
        remaining: 6,
        remainingUom: 'Months',
        location: 'Waco Warehouse GSE',
        updatedLocation: null,
        isArchive: false,
        missingFromReport: false,
        reportDate: '2024-10-20T01:01:02.047',
    },
]);

function updateFirst() {
    console.log(`value before: ${items.value[0].updatedLocation}`);
    items.value[0].updatedLocation = 'First Update';
    console.log(`value after: ${items.value[0].updatedLocation}`);
}

function updateSecond() {
    console.log(`value before: ${items.value[1].updatedLocation}`);
    items.value[1].updatedLocation = 'Second Update';
    console.log(`value after: ${items.value[1].updatedLocation}`);
}
</script>

<template>
    <button type="button" @click="updateFirst">Update First Item</button>
    <button type="button" @click="updateSecond">Update Second Item</button>
    <ag-grid-vue
        class="ag-theme-quartz grid"
        :columnDefs="columnDefs"
        :context="context"
        :cellSelection="true"
        :rowData="items"
        theme="legacy"
    />
</template>

<style scoped>
.grid {
    height: 500px;
    width: 1000px;
}
</style>
