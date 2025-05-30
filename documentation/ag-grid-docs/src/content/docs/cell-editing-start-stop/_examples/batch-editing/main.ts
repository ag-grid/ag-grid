import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    EditingCellPosition,
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
import {
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    PivotModule,
    RowGroupingPanelModule,
} from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([
    NumberEditorModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    FiltersToolPanelModule,
    RowGroupingPanelModule,
    CellSelectionModule,
    TextEditorModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Name',
            children: [
                { field: 'firstName', rowGroup: true },
                { field: 'lastName', rowGroup: true },
            ],
        },
        { field: 'gender', pivot: true },
        { field: 'age', aggFunc: 'sum', cellDataType: 'number' },
        { field: 'mood' },
        { field: 'country' },
        { field: 'address', minWidth: 550 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 110,
        editable: true,
        filter: true,
    },
    sideBar: 'columns',
    pivotPanelShow: 'always',
    cellSelection: true,
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

function getEditingCells() {
    console.log(gridApi!.getEditingCells());
}

let polling: any = undefined;

function pollState() {
    if (polling) {
        clearInterval(polling);
        polling = undefined;
    } else {
        polling = setInterval(getEditingCells, 1000);
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

function setEditingCells(clearValues: boolean = false) {
    const pendingEdits: EditingCellPosition[] = [
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
    gridApi!.setEditingCells(pendingEdits);
}

function clearEditingCells() {
    gridApi!.setEditingCells([]);
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
