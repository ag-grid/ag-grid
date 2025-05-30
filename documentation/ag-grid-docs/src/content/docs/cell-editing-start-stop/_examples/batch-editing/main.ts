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
    HighlightChangesModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    TextEditorModule,
    UndoRedoEditModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
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
    ExcelExportModule,
    UndoRedoEditModule,
    HighlightChangesModule,

    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const pivot = false;
const grouping = false;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Name',
            children: [
                { field: 'firstName', ...(grouping ? { rowGroup: true } : {}) },
                { field: 'lastName', ...(grouping ? { rowGroup: true } : {}) },
            ],
        },
        { field: 'gender', ...(pivot ? { pivot: true } : {}) },
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
        enableCellChangeFlash: true,
    },
    sideBar: 'columns',
    pivotPanelShow: 'always',
    rowData: getData(),
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 5,
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
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
    console.log(gridApi!.getEditingCells({ includePending: true }));
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
    const batch = gridApi!.batchEditingEnabled();

    if (batch) {
        gridApi!.disableBatchEditing();
    } else {
        gridApi!.enableBatchEditing();
    }

    document.getElementById('enablePoll')!.style.display = polling ? 'none' : 'unset';
    document.getElementById('disablePoll')!.style.display = polling ? 'unset' : 'none';

    document.getElementById('batchEditingApi')!.style.display = batch ? 'none' : 'unset';
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

    gridApi!.enableBatchEditing();

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

function onBtExport(type: 'csv' | 'excel') {
    if (type === 'excel') {
        gridApi!.exportDataAsExcel();
    } else {
        gridApi!.exportDataAsCsv({
            fileName: 'batch-editing.csv',
            processCellCallback: (params) => {
                // Example of modifying the cell value before export
                if (params.value && typeof params.value === 'string') {
                    return params.value.toUpperCase(); // Convert string values to uppercase
                }
                return params.value; // Return the original value for other types
            },
            includePendingEdits: true,
        });
    }
}

function onBtUndo() {
    gridApi!.undoCellEditing();
}

function onBtRedo() {
    gridApi!.redoCellEditing();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
