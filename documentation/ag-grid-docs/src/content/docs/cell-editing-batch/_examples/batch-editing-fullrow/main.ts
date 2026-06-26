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
    CheckboxEditorModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import { getData } from './data';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberEditorModule,
    CellSelectionModule,
    TextEditorModule,
    ClientSideRowModelModule,
    CheckboxEditorModule,
    BatchEditModule,
    ClipboardModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'firstName' },
        { field: 'lastName' },
        { field: 'gender' },
        { field: 'age' },
        { field: 'mood' },
        { field: 'country', editable: false },
        { field: 'address', minWidth: 200 },
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
    },
    rowData: getData(),
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
    editType: 'fullRow',
};

function getEditingCells() {
    const cells = gridApi!.getEditingCells();
    console.log('Editing cells:', cells);
}

function startBatchEdit() {
    gridApi!.startBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Active';
}

function commitBatchEdit() {
    gridApi!.commitBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Inactive';
}

function cancelBatchEdit() {
    gridApi!.cancelBatchEdit();
    const el = document.querySelector<HTMLElement>('#batchStatusValue');
    if (el) el.textContent = 'Inactive';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
