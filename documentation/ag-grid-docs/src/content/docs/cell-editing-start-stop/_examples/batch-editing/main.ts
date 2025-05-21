import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellPendingPosition,
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
    onCellValueChanged: (event) => {
        console.log('Cell value changed');
    },
};

function logPendingEdits() {
    console.log(gridApi!.getEditingCells());
}

let polling: any = undefined;

function pollPendingEdits() {
    if (polling) {
        clearInterval(polling);
        polling = undefined;
    } else {
        polling = setInterval(logPendingEdits, 1000);
    }

    document.getElementById('enablePoll')!.style.display = polling ? 'none' : 'unset';
    document.getElementById('disablePoll')!.style.display = polling ? 'unset' : 'none';
}

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

function setBatch(batchEdit: boolean) {
    document.getElementById('enablePoll')!.style.display = batchEdit && polling ? 'none' : 'unset';
    document.getElementById('disablePoll')!.style.display = batchEdit && !polling ? 'none' : 'unset';
    document.getElementById('enableBatch')!.style.display = batchEdit ? 'none' : 'unset';
    document.getElementById('disableBatch')!.style.display = batchEdit ? 'unset' : 'none';
    document.getElementById('stopEdit')!.style.display = batchEdit ? 'unset' : 'none';
    document.getElementById('cancelEdit')!.style.display = batchEdit ? 'unset' : 'none';
    document.getElementById('getPending')!.style.display = batchEdit ? 'unset' : 'none';
    document.getElementById('setPending')!.style.display = batchEdit ? 'unset' : 'none';
    document.getElementById('clearPending')!.style.display = batchEdit ? 'unset' : 'none';

    gridApi!.updateGridOptions({
        batchEdit,
    });
}

function getPendingUpdates() {
    const pendingEdits = gridApi!.getPendingUpdates();
    console.log('Pending Edits: ', pendingEdits);
}

function setPendingUpdates() {
    const pendingEdits: CellPendingPosition[] = [
        {
            rowIndex: 1,
            rowPinned: undefined,
            colKey: 'lastName',
            newValue: 'Smith',
        },
        {
            rowIndex: 2,
            rowPinned: undefined,
            colKey: 'age',
            newValue: 30,
        },
        {
            rowIndex: 1,
            rowPinned: 'top',
            colKey: 'firstName',
            newValue: 'John',
        },
        {
            rowIndex: 0,
            rowPinned: 'bottom',
            colKey: 'firstName',
            newValue: 'Jane',
        },
    ];

    gridApi!.setPendingUpdates(pendingEdits);
}

function clearPendingUpdates() {
    gridApi!.setPendingUpdates([]);
}

function setEditType(editType: any) {
    gridApi!.updateGridOptions({
        editType,
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
