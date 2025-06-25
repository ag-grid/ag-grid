import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellValueChangedEvent,
    GridApi,
    GridOptions,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    NumberEditorModule,
    CellSelectionModule,
    TextEditorModule,
    ClientSideRowModelModule,
    BatchEditModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete', minWidth: 120 },
        { field: 'age', aggFunc: 'avg' },
        { field: 'country' },
        { field: 'date' },
        { field: 'sport', minWidth: 120 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze', minWidth: 100 },
        { headerName: 'Total', valueGetter: 'data.gold + data.silver + data.bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
    },
    grandTotalRow: 'bottom',
    onRowEditingStarted: (_event: RowEditingStartedEvent) => {
        console.log('rowEditingStarted');
    },
    onRowEditingStopped: (_event: RowEditingStoppedEvent) => {
        console.log('rowEditingStopped');
    },
    onCellEditingStarted: (_event: CellEditingStartedEvent) => {
        console.log('cellEditingStarted');
    },
    onCellEditingStopped: (_event: CellEditingStoppedEvent) => {
        console.log('cellEditingStopped');
    },
    onCellValueChanged: (_event: CellValueChangedEvent) => {
        console.log('Cell value changed');
    },
};

function getEditingCells() {
    const cells = gridApi!.getEditingCells({ includePending: true });
    console.log('Editing cells:', cells);
}

function startBatchEdit() {
    gridApi!.startBatchEdit();
}

function commitBatchEdit() {
    gridApi!.commitBatchEdit();
}

function cancelBatchEdit() {
    gridApi!.cancelBatchEdit();
}

function startEdit() {
    gridApi!.startEditingCell({
        rowIndex: 0,
        colKey: 'firstName',
    });
}

function cancelEdit() {
    gridApi!.stopEditing(true);
}

function stopEdit() {
    gridApi!.stopEditing();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
