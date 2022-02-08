import {Grid, GridOptions} from '@ag-grid-community/core'
import {MyInnerRenderer} from "./myInnerRenderer_typescript";

const gridOptions: GridOptions = {
    columnDefs: [
        {field: 'country', rowGroup: true, hide: true},
        {field: 'year', rowGroup: true, hide: true},
        {field: 'gold', aggFunc: 'sum'},
        {field: 'silver', aggFunc: 'sum'},
        {field: 'bronze', aggFunc: 'sum'},
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        minWidth: 300,
        cellRendererParams: {
            innerRenderer: MyInnerRenderer
        }
    },
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    animateRows: true,
    rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    new Grid(gridDiv, gridOptions)
})
