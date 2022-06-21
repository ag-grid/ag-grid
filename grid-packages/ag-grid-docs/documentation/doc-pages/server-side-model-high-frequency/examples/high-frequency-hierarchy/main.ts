import { Grid, AsyncTransactionsFlushed, GetRowIdParams, ColDef, GridApi, GridOptions, IsApplyServerSideTransactionParams, IServerSideDatasource, ServerSideTransaction, ServerSideTransactionResult, ServerSideTransactionResultStatus, ValueFormatterParams } from '@ag-grid-community/core'
declare var FakeServer: any;
var fakeServer = new FakeServer()

const columnDefs: ColDef[] = [
  // keys
  { field: 'productName', rowGroup: true, hide: true },
  { field: 'portfolioName', rowGroup: true, hide: true },
  { field: 'bookId', rowGroup: true, hide: true },

  // {field: 'productId'},
  // {field: 'portfolioId'},
  // {field: 'bookId'},

  // all the other columns (visible and not grouped)
  {
    headerName: 'Current',
    field: 'current',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'Previous',
    field: 'previous',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'Deal Type',
    field: 'dealType',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['Financial', 'Physical'],
    },
  },
  {
    headerName: 'Bid',
    field: 'bidFlag',
    width: 100,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['Buy', 'Sell'],
    },
  },
  {
    headerName: 'PL 1',
    field: 'pl1',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'PL 2',
    field: 'pl2',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'Gain-DX',
    field: 'gainDx',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'SX / PX',
    field: 'sxPx',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: '99 Out',
    field: '_99Out',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'Submitter ID',
    field: 'submitterID',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    headerName: 'Submitted Deal ID',
    field: 'submitterDealID',
    width: 200,
    type: 'numericColumn',
    valueFormatter: numberCellFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
]

const gridOptions: GridOptions = {
  asyncTransactionWaitMillis: 500,
  purgeClosedRowNodes: true,
  rowSelection: 'multiple',
  columnDefs: columnDefs,
  rowModelType: 'serverSide',
  animateRows: true,
  defaultColDef: {
    width: 250,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    field: 'tradeId',
  },
  getRowId: getRowId,
  isApplyServerSideTransaction: isApplyServerSideTransaction,
  onAsyncTransactionsFlushed: onAsyncTransactionsFlushed,
  onGridReady: (params) => {
    var dataSource: IServerSideDatasource = {
      getRows: (params2) => {
        fakeServer.getData(
          params2.request,
          params2.parentNode.data,
          function (result: any[], serverVersion: string) {
            params2.success({
              rowData: result,
              groupLevelInfo: { serverVersion: serverVersion },
            })
          }
        )
      },
    }

    params.api.setServerSideDatasource(dataSource)

    var callback = processUpdateFromFakeServer.bind(window, params.api)

    fakeServer.addUpdateListener(callback)
  },
}

function getRowId(params: any) {
  var data = params.data;
  if (data.tradeId) {
    return data.tradeId
  } else if (data.bookId) {
    return data.bookId
  } else if (data.portfolioId) {
    return data.portfolioId
  } else if (data.productId) {
    return data.productId
  }
}

function isApplyServerSideTransaction(params: IsApplyServerSideTransactionParams) {
  var transactionVersion = (params.transaction as any).serverVersion
  var dataLoadedVersion = params.groupLevelInfo.serverVersion
  var transactionCreatedSinceInitialLoad =
    transactionVersion > dataLoadedVersion
  if (!transactionCreatedSinceInitialLoad) {
    console.log('cancelling transaction')
  }
  return transactionCreatedSinceInitialLoad
}

function onAsyncTransactionsFlushed(e: AsyncTransactionsFlushed) {
  var summary: { [key in ServerSideTransactionResultStatus]?: any } = {};
  (e.results as ServerSideTransactionResult[]).forEach((result: ServerSideTransactionResult) => {
    var status = result.status
    if (summary[status] == null) {
      summary[status] = 0
    }
    summary[status]++
  })
  console.log('onAsyncTransactionsFlushed: ' + JSON.stringify(summary))
}

function numberCellFormatter(params: ValueFormatterParams) {
  return Math.floor(params.value)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function onBtStart() {
  fakeServer.startUpdates()
}

function onBtStop() {
  fakeServer.stopUpdates()
}

function onBtApplyOneTransaction() {
  fakeServer.insertOneRecord()
}

function processUpdateFromFakeServer(gridApi: GridApi, transactions: ServerSideTransaction[]) {
  var updatingJustOneTransaction = transactions.length == 4
  if (updatingJustOneTransaction) {
    console.log('Updating One Record')
  }
  transactions.forEach(function (tx) {
    gridApi.applyServerSideTransactionAsync(tx, function (res) {
      if (updatingJustOneTransaction) {
        console.log(
          'Route [' + (tx.route || []).join(',') + '], status = ' + res.status
        )
      }
    })
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
