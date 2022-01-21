import { Grid, ColDef, GridOptions, ICellRendererParams } from '@ag-grid-community/core'
declare function createBase64FlagsFromResponse(response: any, countryCodes: any, base64flags: any): any;
var countryCodes: any = {}
var base64flags: any = {}

function countryCellRenderer(params: ICellRendererParams) {
  return `<img alt="${params.data.country}" src="${base64flags[countryCodes[params.data.country]]
    }">`
}

const columnDefs: ColDef[] = [
  {
    field: 'country',
    headerName: ' ',
    minWidth: 70,
    width: 70,
    maxWidth: 70,
    cellRenderer: countryCellRenderer,
  },
  { field: 'athlete' },
  { field: 'age' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
    resizable: true,
  },
  defaultExcelExportParams: {
    addImageToCell: function (rowIndex, col, value) {
      if (col.getColId() !== 'country') {
        return
      }

      var countryCode = countryCodes[value]
      return {
        image: {
          id: countryCode,
          base64: base64flags[countryCode],
          imageType: 'png',
          width: 20,
          height: 11,
          position: {
            offsetX: 30,
            offsetY: 5.5,
          },
        },
      }
    },
  },
  onGridReady: params => {
    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
      .then(response =>
        createBase64FlagsFromResponse(response, countryCodes, base64flags)
      )
      .then(data => params.api.setRowData(data))
  },
}

function onBtExport() {
  gridOptions.api!.exportDataAsExcel()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
