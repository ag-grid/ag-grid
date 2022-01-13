import {ColDef, GridOptions} from '@ag-grid-community/core'

declare var PartialMatchFilter: any

const columnDefs: ColDef[] = [
    {field: 'row'},
    {
        field: 'name',
        // spl todo - filterFramework not working for either vue 2 or vue 3
        filterComp: PartialMatchFilter,
        menuTabs: ['filterMenuTab'],
    },
]

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    columnDefs: columnDefs,
    rowData: getData()
}

function onClicked() {
    gridOptions.api!.getFilterInstance('name', function (instance) {
        (instance as any).componentMethod('Hello World!');
    })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new agGrid.Grid(gridDiv, gridOptions)
    gridOptions.api!.sizeColumnsToFit()
})
