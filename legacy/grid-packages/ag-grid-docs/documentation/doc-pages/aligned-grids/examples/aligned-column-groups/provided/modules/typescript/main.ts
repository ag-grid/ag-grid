import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, ColGroupDef, createGrid, GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

const columnDefs: ColGroupDef[] = [
    {
        headerName: 'Group 1',
        groupId: 'Group1',
        children: [
            { field: 'athlete', pinned: true, },
            { field: 'age', pinned: true, columnGroupShow: 'open', },
            { field: 'country', },
            { field: 'year', columnGroupShow: 'open', },
            { field: 'date', },
            { field: 'sport', columnGroupShow: 'open', },
        ]
    },
    {
        headerName: 'Group 2',
        groupId: 'Group2',
        children: [
            { field: 'athlete', pinned: true, },
            { field: 'age', pinned: true, columnGroupShow: 'open', },
            { field: 'country', },
            { field: 'year', columnGroupShow: 'open', },
            { field: 'date', },
            { field: 'sport', columnGroupShow: 'open', },
        ]
    }
];
let topApi: GridApi;
let bottomApi: GridApi;
// this is the grid options for the top grid
const gridOptionsTop: GridOptions = {
    defaultColDef: {
        filter: true,
        flex: 1,
        minWidth: 120
    },
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [bottomApi],
    autoSizeStrategy: {
        type: 'fitGridWidth'
    },
};

// this is the grid options for the bottom grid
const gridOptionsBottom: GridOptions = {
    defaultColDef: {
        filter: true,
        flex: 1,
        minWidth: 120
    },
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [topApi],
};

function setData(rowData: any[]) {
    topApi!.setGridOption('rowData', rowData);
    bottomApi!.setGridOption('rowData', rowData);

    // mix up some columns
    topApi!.moveColumnByIndex(11, 4);
    topApi!.moveColumnByIndex(11, 4);
}

const gridDivTop = document.querySelector<HTMLElement>('#myGridTop')!;
topApi = createGrid(gridDivTop, gridOptionsTop);

const gridDivBottom = document.querySelector<HTMLElement>('#myGridBottom')!;
bottomApi = createGrid(gridDivBottom, gridOptionsBottom);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
        setData(data);
    });

