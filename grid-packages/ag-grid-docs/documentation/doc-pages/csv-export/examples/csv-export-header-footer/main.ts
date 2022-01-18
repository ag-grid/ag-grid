import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },

  suppressExcelExport: true,
  popupParent: document.body,

  columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],

  rowData: [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
  ],
}

function getValue(inputSelector: string) {
  var text = (document.querySelector(inputSelector) as HTMLInputElement).value
  switch (text) {
    case 'string':
      return (
        'Here is a comma, and a some "quotes". You can see them using the\n' +
        'api.getDataAsCsv() button but they will not be visible when the downloaded\n' +
        'CSV file is opened in Excel because string content passed to\n' +
        'prependContent and appendContent is not escaped.'
      )
    case 'array':
      return [
        [],
        [
          {
            data: {
              value: 'Here is a comma, and a some "quotes".',
              type: 'String',
            },
          },
        ],
        [
          {
            data: {
              value:
                'They are visible when the downloaded CSV file is opened in Excel because custom content is properly escaped (provided that suppressQuotes is not set to true)',
              type: 'String',
            },
          },
        ],
        [
          { data: { value: 'this cell:', type: 'String' }, mergeAcross: 1 },
          {
            data: {
              value: 'is empty because the first cell has mergeAcross=1',
              type: 'String',
            },
          },
        ],
        [],
      ]
    case 'none':
      return
    default:
      return text
  }
}

function getParams() {
  return {
    prependContent: getValue('#prependContent'),
    appendContent: getValue('#appendContent'),
    suppressQuotes: undefined,
    columnSeparator: undefined,
  }
}

function onBtnExport() {
  var params = getParams()
  if (params.suppressQuotes || params.columnSeparator) {
    alert(
      'NOTE: you are downloading a file with non-standard quotes or separators - it may not render correctly in Excel.'
    )
  }
  gridOptions.api!.exportDataAsCsv(params)
}

function onBtnUpdate() {
  (document.querySelector('#csvResult') as any).value = gridOptions.api!.getDataAsCsv(
    getParams()
  )
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
