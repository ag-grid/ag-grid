import { ColDef, GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { CustomHeader } from './customHeader_typescript'

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    rowData: null,
    defaultColDef: {
        headerComponent: CustomHeader,
    },
}

function onBtUpperNames() {
    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]
    columnDefs.forEach(function (c) {
        c.headerName = c.field!.toUpperCase()
    })
    gridApi!.setColumnDefs(columnDefs)
}

function onBtLowerNames() {
    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]
    columnDefs.forEach(function (c) {
        c.headerName = c.field
    })
    gridApi!.setColumnDefs(columnDefs)
}

function onBtFilterOn() {
    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]
    columnDefs.forEach(function (c) {
        c.filter = true
    })
    gridApi!.setColumnDefs(columnDefs)
}

function onBtFilterOff() {
    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]
    columnDefs.forEach(function (c) {
        c.filter = false
    })
    gridApi!.setColumnDefs(columnDefs)
}

function onBtResizeOn() {
    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]
    columnDefs.forEach(function (c) {
        c.resizable = true
    })
    gridApi!.setColumnDefs(columnDefs)
}

function onBtResizeOff() {
    const columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ]
    columnDefs.forEach(function (c) {
        c.resizable = false
    })
    gridApi!.setColumnDefs(columnDefs)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);;

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            gridApi!.setRowData(data)
        })
})
