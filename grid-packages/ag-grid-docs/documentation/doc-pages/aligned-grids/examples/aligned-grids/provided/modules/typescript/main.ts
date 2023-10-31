import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef, ColGroupDef, createGrid, Grid, GridApi, GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

const columnDefs: (ColDef | ColGroupDef)[] = [
    { field: "athlete" },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    // in the total col, we have a value getter, which usually means we don't need to provide a field
    // however the master/slave depends on the column id (which is derived from the field if provided) in
    // order to match up the columns
    {
        headerName: 'Medals',
        children: [
            {
                columnGroupShow: 'closed', field: "total",
                valueGetter: "data.gold + data.silver + data.bronze"
            },
            { columnGroupShow: 'open', field: "gold" },
            { columnGroupShow: 'open', field: "silver" },
            { columnGroupShow: 'open', field: "bronze" }
        ]
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
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [bottomApi],
    autoSizeStrategy: {
        type: 'fitGridWidth'
    },
};
const gridDivTop = document.querySelector<HTMLElement>('#myGridTop')!;
const topApi = createGrid(gridDivTop, gridOptionsTop);

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
    rowData: null,
    alignedGrids: () => [topApi]
};
const gridDivBottom = document.querySelector<HTMLElement>('#myGridBottom')!;
const bottomApi = createGrid(gridDivBottom, gridOptionsBottom);

function onCbAthlete(value: boolean) {
    // we only need to update one grid, as the other is a slave
    topApi!.setColumnVisible('athlete', value);
}

function onCbAge(value: boolean) {
    // we only need to update one grid, as the other is a slave
    topApi!.setColumnVisible('age', value);
}

function onCbCountry(value: boolean) {
    // we only need to update one grid, as the other is a slave
    topApi!.setColumnVisible('country', value);
}

function setData(rowData: any[]) {
    topApi!.updateGridOption('rowData', rowData);
    bottomApi!.updateGridOption('rowData', rowData);
}

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => setData(data));


if (typeof window !== 'undefined') {
    // Attach external event handlers to window so they can be called from index.html
    (<any>window).onCbAthlete = onCbAthlete;
    (<any>window).onCbAge = onCbAge;
    (<any>window).onCbCountry = onCbCountry;
}
