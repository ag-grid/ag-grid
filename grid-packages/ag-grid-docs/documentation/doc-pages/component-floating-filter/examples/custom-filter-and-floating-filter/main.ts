import {ColDef, GridOptions} from '@ag-grid-community/core'
import {NumberFloatingFilterComponent} from "./numberFloatingFilterComponent_typescript";
import {NumberFilterComponent} from "./numberFilterComponent_typescript";

const columnDefs: ColDef[] = [
    {field: 'athlete', filterComp: 'agTextColumnFilter'},
    {
        field: 'gold',
        // spl todo floatingFilterFramework doesn't work (vue, but possibly others too)
        floatingFilterComp: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterComp: NumberFilterComponent
    },
    {
        field: 'silver',
        floatingFilterComp: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterComp: NumberFilterComponent
    },
    {
        field: 'bronze',
        floatingFilterComp: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterComp: NumberFilterComponent
    },
    {
        field: 'total',
        floatingFilterComp: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterComp: NumberFilterComponent
    },
]

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
        resizable: true,
    },
    columnDefs: columnDefs,
    rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    new agGrid.Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            gridOptions.api!.setRowData(data)
        })
})
