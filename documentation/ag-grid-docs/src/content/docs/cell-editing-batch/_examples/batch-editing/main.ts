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
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule } from 'ag-grid-enterprise';

import { getData } from './data';
import {
    _decorate,
    _getAllLeafSiblings,
    _getAncestors,
    _getCellCtrl,
    _getDependentCells,
    _getRelatedRows,
} from './utils';

ModuleRegistry.registerModules([
    NumberEditorModule,
    CellSelectionModule,
    TextEditorModule,
    ClientSideRowModelModule,
    CheckboxEditorModule,
    CheckboxEditorModule,
    BatchEditModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'firstName' },
        { field: 'lastName' },
        { field: 'gender' },
        { field: 'age' },
        { field: 'mood' },
        { field: 'country' },
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
});
