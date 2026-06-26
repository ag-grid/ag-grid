import type {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellValueChangedEvent,
    GridApi,
    GridOptions,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    ValueGetterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule, RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberEditorModule,
    CellSelectionModule,
    TextEditorModule,
    ClientSideRowModelModule,
    BatchEditModule,
    ClipboardModule,
    RowGroupingModule,
]);

let gridApi: GridApi;

function sumTotalValueGetter(params: ValueGetterParams): number {
    const { node, data, api } = params;
    const overlay = node ? api.getEditRowValues(node) : undefined;
    const row = Object.assign({}, data, overlay);
    return (row.gold ?? 0) + (row.silver ?? 0) + (row.bronze ?? 0);
}

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
        {
            field: 'total',
            aggFunc: 'sum',
            valueGetter: sumTotalValueGetter,
            editable: false,
        },
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

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
