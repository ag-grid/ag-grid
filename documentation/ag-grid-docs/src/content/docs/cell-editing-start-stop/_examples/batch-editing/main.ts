import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    GridApi,
    GridOptions,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowPinnedType,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    PinnedRowModule,
    ClientSideRowModelModule,
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
        { field: 'address', minWidth: 550 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 110,
        editable: true,
    },
    rowData: getData(),
    pinnedTopRowData: getPinnedTopData(),
    pinnedBottomRowData: getPinnedBottomData(),
    onRowEditingStarted: (event: RowEditingStartedEvent) => {
        console.log('rowEditingStarted');
    },
    onRowEditingStopped: (event: RowEditingStoppedEvent) => {
        console.log('rowEditingStopped');
    },
    onCellEditingStarted: (event: CellEditingStartedEvent) => {
        console.log('cellEditingStarted');
    },
    onCellEditingStopped: (event: CellEditingStoppedEvent) => {
        console.log('cellEditingStopped');
    },
    experimentalEditingModeV2: {
        strategy: 'rowEditMode',
    },
    onCellValueChanged: (event) => {
        console.log('Cell value changed');
    },
};

function getPinnedTopData() {
    return [
        {
            firstName: '##',
            lastName: '##',
            gender: '##',
            address: '##',
            mood: '##',
            country: '##',
        },
        {
            firstName: '###',
            lastName: '###',
            gender: '###',
            address: '###',
            mood: '###',
            country: '###',
        },
    ];
}

function getPinnedBottomData() {
    return [
        {
            firstName: '##',
            lastName: '##',
            gender: '##',
            address: '##',
            mood: '##',
            country: '##',
        },
        {
            firstName: '###',
            lastName: '###',
            gender: '###',
            address: '###',
            mood: '###',
            country: '###',
        },
    ];
}

function onBtStartEditing(key?: string, pinned?: RowPinnedType) {
    gridApi!.setFocusedCell(1, 'lastName', pinned);

    gridApi!.startEditingCell({
        rowIndex: 1,
        colKey: 'lastName',
        // set to 'top', 'bottom' or undefined
        rowPinned: pinned,
        key: key,
    });
}

function updateStrategy(strategy: string) {
    gridApi!.updateGridOptions({
        experimentalEditingModeV2: {
            strategy: strategy as any,
        },
    });
}

function enableBatchEditing() {
    gridApi!.updateGridOptions({
        experimentalEditingModeV2: {
            strategy: 'batchEditMode',
        },
    });
}

function commitEdit() {
    gridApi!.commitEdits();
}

function cancelEdit() {
    gridApi!.cancelEdits();
}

function stopEdit() {
    gridApi!.stopEditing();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
