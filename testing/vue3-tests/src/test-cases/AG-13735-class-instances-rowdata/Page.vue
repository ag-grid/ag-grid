<template>
    <ag-grid-vue
        :columnDefs="colDefs"
        :rowData="rowData"
        class="ag-theme-quartz"
        style="width: 100%; height: 500px"
        theme="legacy"
    />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import type { ColDef } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import MissionRenderer from './MissionRenderer.vue';

class Mission {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public getName() {
        return `Mission: ${this.name}`;
    }
}

const rowData = ref<any[]>([]);

onMounted(async () => {
    rowData.value = [
        { mission: new Mission('name 1') },
        { mission: new Mission('name 2') },
        { mission: new Mission('name 3') },
    ];
});

const colDefs = ref<ColDef[]>([
    {
        field: 'mission',
        width: 150,
        cellRenderer: MissionRenderer,
    },
]);
</script>
