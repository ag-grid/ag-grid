import { Grid, FirstDataRenderedEvent, GridOptions, IDetailCellRendererParams, GetRowIdParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  masterDetail: true,
  isRowMaster: function (dataItem: any) {
    return dataItem ? dataItem.callRecords.length > 0 : false
  },
  columnDefs: [
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
    { field: 'account' },
    { field: 'calls' },
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
  ],
  defaultColDef: {
    flex: 1,
  },
  getRowId: function (params: GetRowIdParams) {
    return params.data.account
  },
  detailCellRendererParams: {
    detailGridOptions: {
      columnDefs: [
        { field: 'callId' },
        { field: 'direction' },
        { field: 'number', minWidth: 150 },
        { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
        { field: 'switchCode', minWidth: 150 },
      ],
      defaultColDef: {
        flex: 1,
      },
    },
    getDetailRowData: function (params) {
      params.successCallback(params.data.callRecords)
    },
  } as IDetailCellRendererParams,
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  // arbitrarily expand a row for presentational purposes
  setTimeout(function () {
    params.api.getDisplayedRowAtIndex(1)!.setExpanded(true)
  }, 0)
}

function onBtClearMilaCalls() {
  var milaSmithRowNode = gridOptions.api!.getRowNode('177001')!
  var milaSmithData = milaSmithRowNode.data
  milaSmithData.callRecords = []
  gridOptions.api!.applyTransaction({ update: [milaSmithData] })
}

function onBtSetMilaCalls() {
  var milaSmithRowNode = gridOptions.api!.getRowNode('177001')!
  var milaSmithData = milaSmithRowNode.data
  milaSmithData.callRecords = [
    {
      name: 'susan',
      callId: 579,
      duration: 23,
      switchCode: 'SW5',
      direction: 'Out',
      number: '(02) 47485405',
    },
    {
      name: 'susan',
      callId: 580,
      duration: 52,
      switchCode: 'SW3',
      direction: 'In',
      number: '(02) 32367069',
    },
  ]
  gridOptions.api!.applyTransaction({ update: [milaSmithData] })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch(
    'https://www.ag-grid.com/example-assets/master-detail-dynamic-data.json'
  )
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
