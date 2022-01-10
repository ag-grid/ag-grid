import { GridOptions } from '@ag-grid-community/core'

var filterParams = {
  textFormatter: replaceAccents,
}

const gridOptions: GridOptions = {
  columnDefs: [
    // set filter
    {
      field: 'athlete',
      filterComp: 'agSetColumnFilter',
      filterParams: filterParams,
    },
    // number filters
    { field: 'gold', filterComp: 'agNumberColumnFilter' },
    { field: 'silver', filterComp: 'agNumberColumnFilter' },
    { field: 'bronze', filterComp: 'agNumberColumnFilter' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    floatingFilter: true,
  },
}

function replaceAccents(value: string) {
  return value
    .replace(new RegExp('[àáâãäå]', 'g'), 'a')
    .replace(new RegExp('æ', 'g'), 'ae')
    .replace(new RegExp('ç', 'g'), 'c')
    .replace(new RegExp('[èéêë]', 'g'), 'e')
    .replace(new RegExp('[ìíîï]', 'g'), 'i')
    .replace(new RegExp('ñ', 'g'), 'n')
    .replace(new RegExp('[òóôõøö]', 'g'), 'o')
    .replace(new RegExp('œ', 'g'), 'oe')
    .replace(new RegExp('[ùúûü]', 'g'), 'u')
    .replace(new RegExp('[ýÿ]', 'g'), 'y')
    .replace(new RegExp('\\W', 'g'), '')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
