import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, ColGroupDef, createGrid, GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

const columnDefs: ColGroupDef[] = [
    {
        headerName: 'Group 1',
        headerClass: 'blue',
        groupId: 'Group1',
        children: [
            { field: 'athlete', pinned: true, width: 100 },
            { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
            { field: 'country', width: 100 },
            { field: 'year', columnGroupShow: 'open', width: 100 },
            { field: 'date', width: 100 },
            { field: 'sport', columnGroupShow: 'open', width: 100 },
            { field: 'date', width: 100 },
            { field: 'sport', columnGroupShow: 'open', width: 100 }
        ]
    },
    {
        headerName: 'Group 2',
        headerClass: 'green',
        groupId: 'Group2',
        children: [
            { field: 'athlete', pinned: true, width: 100 },
            { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
            { field: 'country', width: 100 },
            { field: 'year', columnGroupShow: 'open', width: 100 },
            { field: 'date', width: 100 },
            { field: 'sport', columnGroupShow: 'open', width: 100 },
            { field: 'date', width: 100 },
            { field: 'sport', columnGroupShow: 'open', width: 100 }
        ]
    }
];
let topApi: GridApi;
let bottomApi: GridApi;
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
    alignedGrids: () => [topApi],
};

function setData(rowData: any[]) {
    topApi!.updateGridOption('rowData', rowData);
    bottomApi!.updateGridOption('rowData', rowData);

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

