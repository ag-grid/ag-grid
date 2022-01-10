import { GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
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
      innerRenderer: (params: any) => {
        if (params.node.footer) {
          const isRootLevel = params.node.level === -1
          if (isRootLevel) {
            return `<span style="color:navy; font-weight:bold">Grand Total</span>`
          }
          return `<span style="color:navy">Sub Total ${params.value}</span>`
        }
        return params.value
      },
    },
  },
  groupIncludeFooter: true,
  groupIncludeTotalFooter: true,
  animateRows: true,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)
})
