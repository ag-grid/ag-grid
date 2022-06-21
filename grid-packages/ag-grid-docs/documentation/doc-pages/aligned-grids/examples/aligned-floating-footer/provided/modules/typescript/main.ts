import { ColDef, Grid, GridOptions } from "@ag-grid-community/core";
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 200 },
    { field: 'age', width: 100 },
    { field: 'country', width: 150 },
    { field: 'year', width: 120 },
    { field: 'sport', width: 200 },
    // in the total col, we have a value getter, which usually means we don't need to provide a field
    // however the master/slave depends on the column id (which is derived from the field if provided) in
    // order ot match up the columns
    {
        headerName: 'Total',
        field: 'total',
        valueGetter: 'data.gold + data.silver + data.bronze',
        width: 200
    },
    { field: 'gold', width: 100 },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 }
];

const dataForBottomGrid = [
    {
        athlete: 'Total',
        age: '15 - 61',
        country: 'Ireland',
        year: '2020',
        date: '26/11/1970',
        sport: 'Synchronised Riding',
        gold: 55,
        silver: 65,
        bronze: 12
    }
];

// this is the grid options for the top grid
const gridOptionsTop: GridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    columnDefs,
    rowData: null,
    // debug: true,
    // don't show the horizontal scrollbar on the top grid
    suppressHorizontalScroll: true,
    alignedGrids: []
};

// this is the grid options for the bottom grid
const gridOptionsBottom: GridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    columnDefs: columnDefs,
    // we are hard coding the data here, it's just for demo purposes
    rowData: dataForBottomGrid,
    // debug: true,
    rowClass: 'bold-row',
    // hide the header on the bottom grid
    headerHeight: 0,
    alignedGrids: []
};

gridOptionsTop.alignedGrids!.push(gridOptionsBottom);
gridOptionsBottom.alignedGrids!.push(gridOptionsTop);

const gridDivTop = document.querySelector<HTMLElement>('#myGridTop')!;
new Grid(gridDivTop, gridOptionsTop);

const gridDivBottom = document.querySelector<HTMLElement>('#myGridBottom')!;
new Grid(gridDivBottom, gridOptionsBottom);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
        gridOptionsTop.api!.setRowData(data);
        gridOptionsTop.columnApi!.autoSizeAllColumns();
    });
