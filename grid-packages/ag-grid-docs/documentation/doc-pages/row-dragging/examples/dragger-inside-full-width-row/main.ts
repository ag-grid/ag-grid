import { Grid, GridOptions, ICellRendererParams } from '@ag-grid-community/core'
import { FullWidthCellRenderer } from './fullWidthCellRenderer_typescript'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'name', cellRendererComp: countryCellRenderer },
    { field: 'continent' },
    { field: 'language' },
  ],
  defaultColDef: {
    flex: 1,
    sortable: true,
    resizable: true,
    filter: true,
  },
  rowData: getData(),
  rowDragManaged: true,
  getRowHeight: function (params) {
    // return 100px height for full width rows
    if (isFullWidth(params.data)) {
      return 100
    }
  },
  isFullWidthCell: function (rowNode) {
    return isFullWidth(rowNode.data)
  },
  // see AG Grid docs cellRenderer for details on how to build cellRenderers
  fullWidthCellComp: FullWidthCellRenderer,
  animateRows: true,
}

function countryCellRenderer(params: ICellRendererParams) {
  var flag =
    '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/flags/' +
    params.data.code +
    '.png">'
  return (
    '<span style="cursor: default;">' + flag + ' ' + params.value + '</span>'
  )
}

function isFullWidth(data: any) {
  // return true when country is Peru, France or Italy
  return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
