import { Grid, AsyncTransactionsFlushed, ColDef, GridOptions, IsApplyServerSideTransactionParams, IServerSideDatasource, ServerSideTransactionResult, ServerSideTransactionResultStatus, GetRowIdParams } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [{ field: 'product' }, { field: 'value' }]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true,
  },
  onAsyncTransactionsFlushed: (e: AsyncTransactionsFlushed) => {
    var summary: { [key in ServerSideTransactionResultStatus]?: any } = {};
    (e.results as ServerSideTransactionResult[]).forEach((result: ServerSideTransactionResult) => {
      var status = result.status
      if (summary[status] == null) {
        summary[status] = 0
      }
      summary[status]++
    })
    console.log('onAsyncTransactionsFlushed: ' + JSON.stringify(summary))
  },
  isApplyServerSideTransaction: (params: IsApplyServerSideTransactionParams) => {
    var tx = params.transaction as any;
    var groupLevelInfo = params.groupLevelInfo
    var txCreatedSinceRowDataRead = tx.serverVersion > groupLevelInfo.serverVersion
    console.log(
      'tx.serverVersion = ' +
      tx.serverVersion +
      ', groupLevelInfo.serverVersion = ' +
      groupLevelInfo.serverVersion
    )
    if (txCreatedSinceRowDataRead) {
      console.log('Applying transaction')
      return true
    } else {
      console.log('Cancelling transaction')
      return false
    }
  },
  onGridReady: (params) => {
    setupData()

    var dataSource: IServerSideDatasource = {
      getRows: (params2) => {
        setTimeout(function () {
          var rowData = allServerSideData.slice()
          console.log(
            'getRows: found ' + rowData.length + ' records on server.'
          )

          params2.success({
            rowData: rowData,
            groupLevelInfo: { serverVersion: serverVersion },
          })
        }, 2000)
      },
    }

    params.api.setServerSideDatasource(dataSource)
  },
  getRowId: (params: GetRowIdParams) => {
    return params.data.product
  },
  rowModelType: 'serverSide',
  columnDefs: columnDefs,
}

var products = ['Palm Oil', 'Rubber', 'Wool', 'Amber', 'Copper']

var newProductSequence = 0

var all_products = [
  'Palm Oil',
  'Rubber',
  'Wool',
  'Amber',
  'Copper',
  'Lead',
  'Zinc',
  'Tin',
  'Aluminium',
  'Aluminium Alloy',
  'Nickel',
  'Cobalt',
  'Molybdenum',
  'Recycled Steel',
  'Corn',
  'Oats',
  'Rough Rice',
  'Soybeans',
  'Rapeseed',
  'Soybean Meal',
  'Soybean Oil',
  'Wheat',
  'Milk',
  'Coca',
  'Coffee C',
  'Cotton No.2',
  'Sugar No.11',
  'Sugar No.14',
]

var allServerSideData: any[] = []

function setupData() {
  products.forEach(function (product, index) {
    allServerSideData.push({
      product: product,
      value: Math.floor(Math.random() * 10000),
    })
  })
}

var serverVersion = 0

function onBtAdd() {
  var newProductName =
    all_products[Math.floor(all_products.length * Math.random())]
  var newItem = {
    product: newProductName + ' ' + newProductSequence++,
    value: Math.floor(Math.random() * 10000),
  }
  allServerSideData.push(newItem)
  serverVersion++
  var tx = {
    add: [newItem],
    serverVersion: serverVersion,
  }
  gridOptions.api!.applyServerSideTransactionAsync(tx)
}

function onBtRefresh() {
  gridOptions.api!.refreshServerSide({ purge: true })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
