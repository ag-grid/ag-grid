import { Grid, CellClassParams, GridOptions, ProcessRowGroupForExportParams } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', minWidth: 120, rowGroup: true },
    { field: 'year', rowGroup: true },
    { headerName: 'Name', field: 'athlete', minWidth: 150 },
    {
      headerName: 'Name Length',
      valueGetter: 'data ? data.athlete.length : ""',
    },
    { field: 'sport', minWidth: 120, rowGroup: true },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],

  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },

  groupDefaultExpanded: -1,

  autoGroupColumnDef: {
    cellClass: getIndentClass,
    minWidth: 250,
    flex: 1,
  },

  excelStyles: [
    {
      id: 'indent-1',
      alignment: {
        indent: 1,
      },
      // note, dataType: 'string' required to ensure that numeric values aren't right-aligned
      dataType: 'String',
    },
    {
      id: 'indent-2',
      alignment: {
        indent: 2,
      },
      dataType: 'String',
    },
    {
      id: 'indent-3',
      alignment: {
        indent: 3,
      },
      dataType: 'String',
    },
  ],
}

function rowGroupCallback(params: ProcessRowGroupForExportParams) {
  return params.node.key!;
}

function getIndentClass(params: CellClassParams) {
  var indent = 0
  var node = params.node

  while (node && node.parent) {
    indent++
    node = node.parent
  }
  return 'indent-' + indent
}

function onBtnExportDataAsExcel() {
  gridOptions.api!.exportDataAsExcel({
    processRowGroupCallback: rowGroupCallback,
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
