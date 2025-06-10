import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    EditingCellPosition,
    GridApi,
    GridOptions,
    IAggFuncParams,
    IRowNode,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowPinnedType,
} from 'ag-grid-community';
import {
    CheckboxEditorModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    UndoRedoEditModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    AggregationModule,
    CellSelectionModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    IntegratedChartsModule,
    PivotModule,
    RowGroupingPanelModule,
    StatusBarModule,
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
    RowDragModule,
    AggregationModule,
    ClientSideRowModelApiModule,
    StatusBarModule,
    CheckboxEditorModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    RowSelectionModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const uniqOrDots = (params: IAggFuncParams) => {
    // distinct count of first names
    const uniqueNames = new Set<string>();
    params.values.forEach((value) => {
        if (value) {
            uniqueNames.add(value);
        }
    });
    return `${uniqueNames.size} / ${params.values.length}`;
};

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Name',
            children: [
                {
                    field: 'firstName',
                    enableRowGroup: true,
                    enablePivot: true,
                    aggFunc: uniqOrDots,
                    rowGroup: true,
                },
                {
                    field: 'lastName',
                    enableRowGroup: true,
                    enablePivot: true,
                    aggFunc: uniqOrDots,
                },
                {
                    headerName: 'Details',
                    valueFormatter: (params) => {
                        const names = [];
                        params.data?.firstName && names.push(params.data.firstName);
                        params.data?.lastName && names.push(params.data.lastName);
                        params.data?.age && names.push(`(${params.data.age})`);
                        return names.length > 0 ? names.join(' ') : '';
                    },
                    editable: false,
                    minWidth: 145,
                },
            ],
        },
        { field: 'gender', enableRowGroup: true, enablePivot: true, aggFunc: uniqOrDots },
        { field: 'exists', cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor' },
        { field: 'age', aggFunc: 'sum', cellDataType: 'number', enableValue: true },
        { field: 'mood', enableRowGroup: true, enablePivot: true, aggFunc: uniqOrDots },
        { field: 'country', enableRowGroup: true, enablePivot: true, aggFunc: uniqOrDots },
        { field: 'address', minWidth: 550 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 110,
        editable: true,
        filter: true,
        enableCellChangeFlash: true,
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        valueSetter: (params): boolean => {
            console.log('valueSetter called for autoGroupColumnDef');
            return true;
        },
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
    enableCharts: true,

    rowDragManaged: true,
    enableRowPinning: true,
    groupDisplayType: 'multipleColumns',
    groupDefaultExpanded: 1,
    isRowPinned: (rowNode: IRowNode) => {
        // pinning the first two rows at the top
        if (rowNode.data?.firstName === 'Jane') {
            return 'top';
        }
        if (rowNode.data?.firstName === 'John') {
            return 'bottom';
        }
    },
    rowSelection: { mode: 'multiRow' },
    suppressAggFuncInHeader: true,
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent' },
            { statusPanel: 'agTotalRowCountComponent' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agSelectedRowCountComponent' },
            { statusPanel: 'agAggregationComponent' },
        ],
    },
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

function createChart() {
    gridApi!.createRangeChart({
        chartType: 'groupedColumn',
        cellRange: {
            rowStartIndex: 12,
            rowEndIndex: 14,
            columns: ['mood', 'age'],
        },
        // other options...
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
            rowIndex: 14,
            rowPinned: undefined,
            newValue: 100,
            colKey: 'age',
        },
        {
            rowIndex: 14,
            rowPinned: undefined,
            newValue: 'Ecstatic',
            colKey: 'mood',
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
    console.log('Setting edit type to:', editType);
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
