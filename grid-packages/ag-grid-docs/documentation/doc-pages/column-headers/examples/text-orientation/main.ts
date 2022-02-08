import { ColGroupDef, Grid, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColGroupDef[] = [
    {
        headerName: 'Athlete Details',
        children: [
            {
                field: 'athlete',
                width: 150,
                suppressSizeToFit: true,
                enableRowGroup: true,
                rowGroupIndex: 0,
            },
            {
                field: 'age',
                width: 90,
                minWidth: 75,
                maxWidth: 100,
                enableRowGroup: true,
            },
            {
                field: 'country',
                width: 120,
                enableRowGroup: true,
            },
            {
                field: 'year',
                width: 90,
                enableRowGroup: true,
                pivotIndex: 0,
            },
            { field: 'sport', width: 110, enableRowGroup: true },
            {
                field: 'gold',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum',
            },
            {
                field: 'silver',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum',
            },
            {
                field: 'bronze',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum',
            },
            {
                field: 'total',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum',
            },
        ],
    },
]

const gridOptions: GridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true,
    },
    columnDefs: columnDefs,
    rowData: null,
    groupHeaderHeight: 75,
    headerHeight: 150,
    floatingFiltersHeight: 50,
    pivotGroupHeaderHeight: 50,
    pivotHeaderHeight: 100,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api!.setRowData(data))
})
