<template>
    <div style="height: 500px; box-sizing: border-box">
        <button role="button" @click="onClick">click</button>
        <ag-grid-vue
            v-model="rowData"
            style="width: 100%; height: 500px"
            class="ag-theme-quartz-dark"
            :columnDefs="columnDefs"
            :defaultColDef="{ editable: true }"
            theme="legacy"
        />
    </div>
    <div style="margin-top: 20px; height: 20px">[[{{ rowData }}]]</div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

const columnDefs = ref([{ headerName: 'Col 1', field: 'col1' }]);

const rowData = ref<any>(null);

onBeforeMount(() => {
    rowData.value = [{ col1: 'row 1 col1' }, { col1: 'row 2 col1' }];
});

const onClick = () => {
    rowData.value[1].col1 = 'row 2 new col1';
};
</script>
