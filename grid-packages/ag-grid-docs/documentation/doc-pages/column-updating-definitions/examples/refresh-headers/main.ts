import { ColDef, Grid, GridOptions } from '@ag-grid-community/core'
import { CustomHeader } from './customHeader_typescript'

const gridOptions: GridOptions = {
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
    gridOptions.api!.setColumnDefs(columnDefs)
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
    gridOptions.api!.setColumnDefs(columnDefs)
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
    gridOptions.api!.setColumnDefs(columnDefs)
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
    gridOptions.api!.setColumnDefs(columnDefs)
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
    gridOptions.api!.setColumnDefs(columnDefs)
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
    gridOptions.api!.setColumnDefs(columnDefs)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            gridOptions.api!.setRowData(data)
        })
})
