<template>
    <button @click="updateRows">Update rows</button>
    <button @click="handler = onRowDataUpdatedB">Replace handler</button>
    <button @click="handler = undefined">Remove handler</button>
    <p>
        Handler A calls: <span data-testid="calls-a">{{ callsA }}</span
        >, handler B calls: <span data-testid="calls-b">{{ callsB }}</span
        >, api listener calls:
        <span data-testid="api-calls">{{ apiCalls }}</span>
    </p>
    <ag-grid-vue
        style="width: 100%; height: 300px"
        class="ag-theme-quartz"
        theme="legacy"
        :columnDefs="colDefs"
        :rowData="rowData"
        :onRowDataUpdated="handler"
        @grid-ready="onGridReady"
    />
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

const colDefs: ColDef[] = [{ field: 'make' }, { field: 'price' }];
const rowData = ref([{ make: 'Tesla', price: 1 }]);
const callsA = ref(0);
const callsB = ref(0);
const apiCalls = ref(0);

const onRowDataUpdatedA = () => callsA.value++;
const onRowDataUpdatedB = () => callsB.value++;
const handler = shallowRef<(() => void) | undefined>(onRowDataUpdatedA);

// an api listener is called in the same batch as, and before, the gridOptions handler
const onGridReady = ({ api }: GridReadyEvent) => api.addEventListener('rowDataUpdated', () => apiCalls.value++);

const updateRows = () => {
    rowData.value = [{ make: 'Tesla', price: rowData.value[0].price + 1 }];
};
</script>
