import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
import { NumberFloatingFilterComponent } from "./numberFloatingFilterComponent_typescript";
import { NumberFilterComponent } from "./numberFilterComponent_typescript";

const columnDefs: ColDef[] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    {
        field: 'gold',
        floatingFilterComponentFramework: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterFramework: NumberFilterComponent
    },
    {
        field: 'silver',
        floatingFilterComponentFramework: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterFramework: NumberFilterComponent
    },
    {
        field: 'bronze',
        floatingFilterComponentFramework: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterFramework: NumberFilterComponent
    },
    {
        field: 'total',
        floatingFilterComponentFramework: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filterFramework: NumberFilterComponent
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
    new Grid(gridDiv, gridOptions)

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            gridOptions.api!.setRowData(data)
        })
})
