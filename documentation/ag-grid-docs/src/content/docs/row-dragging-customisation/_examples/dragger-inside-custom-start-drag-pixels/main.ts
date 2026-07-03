import type {
    ColDef,
    GridApi,
    GridOptions,
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEnterEvent,
} from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowDragModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

import { CustomCellRenderer } from './customCellRenderer_typescript';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    RowDragModule,
    CellStyleModule,
    ClientSideRowModelModule,
]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        cellClass: 'custom-athlete-cell',
        cellRenderer: CustomCellRenderer,
    },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        width: 170,
        filter: true,
    },
    rowDragManaged: true,
    columnDefs: columnDefs,
    onRowDragEnter: onRowDragEnter,
    onRowDragEnd: onRowDragEnd,
    onRowDragCancel: onRowDragCancel,
};

function onRowDragEnter(e: RowDragEnterEvent) {
    console.log('onRowDragEnter: node', e.node.id);
}

function onRowDragEnd(e: RowDragEndEvent) {
    console.log('onRowDragEnd: node', e.node.id);
}

function onRowDragCancel(e: RowDragCancelEvent) {
    console.log('onRowDragCancel: node', e.node.id);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
