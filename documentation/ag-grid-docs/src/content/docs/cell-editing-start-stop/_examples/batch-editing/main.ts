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

let rowEvents: any[] = [];
let cellEvents: any[] = [];

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
    cellSelection: true,
    rowData: getData(),
    pinnedTopRowData: getPinnedTopData(),
    pinnedBottomRowData: getPinnedBottomData(),
    onRowEditingStarted: (event: RowEditingStartedEvent) => {
        rowEvents.push(event);
        console.log('rowEditingStarted', { rowEvents: rowEvents.length, cellEvents: cellEvents.length });
    },
    onRowEditingStopped: (event: RowEditingStoppedEvent) => {
        rowEvents.splice(0, 1);
        console.log('rowEditingStopped', { rowEvents: rowEvents.length, cellEvents: cellEvents.length });
    },
    onCellEditingStarted: (event: CellEditingStartedEvent) => {
        cellEvents.push(event);
        console.log('cellEditingStarted', { rowEvents: rowEvents.length, cellEvents: cellEvents.length });
    },
    onCellEditingStopped: (event: CellEditingStoppedEvent) => {
        cellEvents.splice(0, 1);
        console.log('cellEditingStopped', { rowEvents: rowEvents.length, cellEvents: cellEvents.length });
    },
    onCellValueChanged: (event) => {
        console.log('Cell value changed');
    },
};

function getPendingUpdates() {
    console.log(gridApi!.getPendingUpdates());
}

function logState(counts?: boolean) {
    const editingCells = gridApi!.getEditingCells();
    const pendingUpdates = gridApi!.getPendingUpdates();

    console.log({
        editingCells: counts ? editingCells.length : editingCells,
        pendingUpdates: counts ? pendingUpdates.length : pendingUpdates,
    });
}

let polling: any = undefined;

function pollState() {
    if (polling) {
        clearInterval(polling);
        polling = undefined;
    } else {
        polling = setInterval(() => logState(true), 1000);
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

function toggleBatch() {
    const batchEdit = !gridApi!.getGridOption('batchEdit');
    document.getElementById('enablePoll')!.style.display = polling ? 'none' : 'unset';
    document.getElementById('disablePoll')!.style.display = polling ? 'unset' : 'none';

    document.getElementById('batchEditingApi')!.style.display = batchEdit ? 'unset' : 'none';

    gridApi!.updateGridOptions({
        batchEdit,
    });
}

function setPendingUpdates(clearValues: boolean = false) {
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
            state: 'editing',
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

    if (clearValues) {
        pendingEdits.forEach((edit) => {
            edit.newValue = null;
        });
    }

    gridApi!.setGridOption('batchEdit', true);
    gridApi!.setPendingUpdates(pendingEdits);
}

function clearPendingUpdates() {
    gridApi!.setPendingUpdates([]);
}

function setEditType(editType: any) {
    (document.getElementById('singleCell')! as HTMLInputElement).checked = editType !== 'fullRow';
    (document.getElementById('fullRow')! as HTMLInputElement).checked = editType === 'fullRow';

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
