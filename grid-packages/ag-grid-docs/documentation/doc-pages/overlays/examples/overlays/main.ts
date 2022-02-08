import {Grid, GridOptions} from '@ag-grid-community/core'

const gridOptions: GridOptions = {
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
        '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
    overlayNoRowsTemplate:
        '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">This is a custom \'no rows\' overlay</span>',
}

function onBtShowLoading() {
    gridOptions.api!.showLoadingOverlay()
}

function onBtShowNoRows() {
    gridOptions.api!.showNoRowsOverlay()
}

function onBtHide() {
    gridOptions.api!.hideOverlay()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api!.setRowData(data))
})
