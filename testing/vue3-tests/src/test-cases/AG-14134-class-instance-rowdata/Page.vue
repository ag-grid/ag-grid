<template>
    <div style="width: 100%; height: 500px">
        <ag-grid-vue
            class="ag-theme-quartz"
            style="width: 100%; height: 200px"
            :columnDefs="colDefs"
            :rowData="rowData"
            theme="legacy"
            :rowSelection="rowSelection"
            @selection-changed="onSelectionChanged"
        />
        <span aria-label="selection-check">{{ selectionCheck }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { ColDef, RowSelectionOptions, SelectionChangedEvent } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

import NameRenderer from './NameRenderer.vue';

class Mission {
    public name: string;
    constructor(name: string) {
        this.name = name;
    }
    public get formattedName() {
        return `Mission: ${this.name}`;
    }
}

const mission1 = new Mission('name 1');
const compareMissions = [mission1];

const rowData = ref<Mission[]>([mission1]);

const colDefs = ref<ColDef[]>([
    {
        field: 'formattedName',
        width: 300,
        cellRenderer: NameRenderer,
    },
]);

const rowSelection = ref<RowSelectionOptions>({
    mode: 'multiRow',
    headerCheckbox: false,
});

const selectionCheck = ref('');

const onSelectionChanged = (event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    const data = selectedNodes[0].data;

    const isMission = data instanceof Mission;
    const original = compareMissions.find((cItem) => data.name === cItem.name);
    const sameInstance = data === original;

    selectionCheck.value = `${isMission}-${sameInstance}`;
};
</script>
