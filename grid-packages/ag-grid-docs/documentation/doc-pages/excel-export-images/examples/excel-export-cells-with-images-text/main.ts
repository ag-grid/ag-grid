import { ColDef, GridOptions, ICellRendererParams } from '@ag-grid-community/core'
declare function createBase64FlagsFromResponse(response: any, countryCodes: any, base64flags: any): any;
var countryCodes: any = {}
var base64flags: any = {}

function countryCellRenderer(params: ICellRendererParams) {
  const country = params.data.country
  return `<img alt="${country}" src="${base64flags[countryCodes[country]]
    }"> ${country}`
}

const columnDefs: ColDef[] = [
  { field: 'athlete', width: 200 },
  {
    field: 'country',
    cellClass: 'countryCell',
    cellRendererComp: countryCellRenderer,
  },
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
  excelStyles: [
    {
      id: 'countryCell',
      alignment: {
        vertical: 'Center',
        indent: 4,
      },
    },
  ],
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
            offsetX: 10,
            offsetY: 5.5,
          },
        },
        value,
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
  new agGrid.Grid(gridDiv, gridOptions)
})
