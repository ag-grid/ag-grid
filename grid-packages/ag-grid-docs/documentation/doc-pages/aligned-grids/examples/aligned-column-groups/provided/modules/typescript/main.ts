import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColGroupDef, Grid, GridOptions, ModuleRegistry } from '@ag-grid-community/core';
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
    // debug: true,
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
    rowData: null,
    // debug: true,
    alignedGrids: []
};

gridOptionsTop.alignedGrids!.push(gridOptionsBottom);
gridOptionsBottom.alignedGrids!.push(gridOptionsTop);

function setData(rowData: any[]) {
    gridOptionsTop.api!.setRowData(rowData);
    gridOptionsBottom.api!.setRowData(rowData);
    gridOptionsTop.api!.sizeColumnsToFit();

    // mix up some columns
    gridOptionsTop.columnApi!.moveColumnByIndex(11, 4);
    gridOptionsTop.columnApi!.moveColumnByIndex(11, 4);
}

const gridDivTop = document.querySelector<HTMLElement>('#myGridTop')!;
new Grid(gridDivTop, gridOptionsTop);

const gridDivBottom = document.querySelector<HTMLElement>('#myGridBottom')!;
new Grid(gridDivBottom, gridOptionsBottom);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
        setData(data);
    });

