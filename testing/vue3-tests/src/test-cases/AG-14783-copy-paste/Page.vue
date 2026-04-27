<template>
    <ag-grid-vue
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :processDataFromClipboard="processDataFromClipboard"
        :rowData="rowData"
        :rowSelection="rowSelection"
        style="width: 100%; height: 475px"
        @grid-ready="onGridReady"
        class="ag-theme-alpine"
        theme="legacy"
    >
    </ag-grid-vue>
</template>

<script setup>
import { ref, shallowRef } from 'vue';

import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberEditorModule,
    RowApiModule,
    RowSelectionModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule, ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

ModuleRegistry.registerModules([
    ColumnApiModule,
    RowApiModule,
    ClientSideRowModelApiModule,
    NumberEditorModule,
    TextEditorModule,
    RowSelectionModule,
    ClientSideRowModelModule,
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    CellSelectionModule,
    ValidationModule /* Development Only */,
]);
const gridApi = shallowRef(null);
const columnDefs = ref([
    { headerName: 'Athlete', field: 'athlete', width: 150 },
    { headerName: 'Age', field: 'age', width: 90 },
    { headerName: 'Country', field: 'country', width: 120 },
    { headerName: 'Year', field: 'year', width: 90 },
    { headerName: 'Date', field: 'date', width: 110 },
    { headerName: 'Sport', field: 'sport', width: 110 },
]);
const defaultColDef = ref({
    editable: true,
});
const rowSelection = ref({
    mode: 'multiRow',
    checkboxes: false,
    headerCheckbox: false,
    enableClickSelection: true,
    copySelectedRows: true,
});
const rowData = ref(null);

const onGridReady = (params) => {
    gridApi.value = params.api;

    const updateData = (data) => (rowData.value = data.slice(0, 8));

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((resp) => resp.json())
        .then((data) => {
            rowData.value = data.slice(0, 10);
        });
};
const processDataFromClipboard = (params) => {
    const data = [...params.data];
    const emptyLastRow = data[data.length - 1][0] === '' && data[data.length - 1].length === 1;
    if (emptyLastRow) {
        data.splice(data.length - 1, 1);
    }
    const lastIndex = params.api.getDisplayedRowCount() - 1;
    const focusedCell = params.api.getFocusedCell();
    const focusedIndex = focusedCell.rowIndex;
    if (focusedIndex + data.length - 1 > lastIndex) {
        const resultLastIndex = focusedIndex + (data.length - 1);
        const numRowsToAdd = resultLastIndex - lastIndex;
        const rowsToAdd = [];
        for (let i = 0; i < numRowsToAdd; i++) {
            const index = data.length - 1;
            const row = data.slice(index, index + 1)[0];
            // Create row object
            const rowObject = {};
            let currentColumn = focusedCell.column;
            row.forEach((item) => {
                if (!currentColumn) {
                    return;
                }
                rowObject[currentColumn.colDef.field] = item;
                currentColumn = params.api.getDisplayedColAfter(currentColumn);
            });
            rowsToAdd.push(rowObject);
        }
        params.api.applyTransaction({ add: rowsToAdd });
    }
    return data;
};
</script>
