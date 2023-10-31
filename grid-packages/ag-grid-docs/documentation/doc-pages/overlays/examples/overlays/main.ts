import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {field: 'athlete', minWidth: 200},
        {field: 'age'},
        {field: 'country', minWidth: 200},
        {field: 'year'},
        {field: 'date', minWidth: 180},
        {field: 'sport', minWidth: 200},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'},
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },

    // custom loading template. the class ag-overlay-loading-center is part of the grid,
    // it gives a white background and rounded border
    overlayLoadingTemplate:
        '<object style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) scale(2)" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>',
    overlayNoRowsTemplate:
        '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">This is a custom \'no rows\' overlay</span>',
}

function onBtShowLoading() {
    gridApi!.showLoadingOverlay()
}

function onBtShowNoRows() {
    gridApi!.showNoRowsOverlay()
}

function onBtHide() {
    gridApi!.hideOverlay()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then((data: IOlympicData[]) => gridApi!.updateGridOption('rowData', data))
})
