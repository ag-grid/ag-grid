import { Grid, ColDef, GridOptions, GridReadyEvent, IServerSideDatasource, IServerSideGetRowsParams, ServerSideGroupLevelParams, GetServerSideGroupLevelParamsParams, GetRowIdParams } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'productName', rowGroup: true, hide: true },
  { field: 'tradeName' },
  { field: 'value' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 250,
    resizable: true,
  },
  getRowId: (params: GetRowIdParams) => {
    return params.data.id
  },
  rowModelType: 'serverSide',
  columnDefs: columnDefs,
  animateRows: true,
  purgeClosedRowNodes: true,
  onGridReady: (params: GridReadyEvent) => {
    setupData()

    const dataSource: IServerSideDatasource = {
      getRows: (params2: IServerSideGetRowsParams) => {
        // To make the demo look real, wait for 500ms before returning
        setTimeout(function () {
          const doingTopLevel = params2.request.groupKeys.length == 0

          if (doingTopLevel) {
            params2.success({
              rowData: products.slice(),
              rowCount: products.length,
            })
          } else {
            const key = params2.request.groupKeys[0]
            let foundProduct: any = undefined;
            products.forEach(function (product) {
              if (product.productName == key) {
                foundProduct = product
              }
            })
            if (foundProduct) {
              params2.success({ rowData: foundProduct.trades })
            } else {
              params2.fail();
            }
          }
        }, 2000)
      },
    }

    params.api.setServerSideDatasource(dataSource)
  },
  getServerSideGroupLevelParams: (params: GetServerSideGroupLevelParamsParams): ServerSideGroupLevelParams => {
    return {
      infiniteScroll: params.level == 0,
    }
  },
}
const productsNames = ['Palm Oil', 'Rubber', 'Wool', 'Amber', 'Copper']
const products: any[] = []
let idSequence = 0

function createOneTrade() {
  return {
    id: idSequence++,
    tradeName: 'TRD-' + Math.floor(Math.random() * 20000),
    value: Math.floor(Math.random() * 20000),
  }
}

function setupData() {
  productsNames.forEach(function (productName) {
    const product: any = { id: idSequence++, productName: productName, trades: [] }
    products.push(product)
    for (let i = 0; i < 2; i++) {
      product.trades.push(createOneTrade())
    }
  })
}

function onBtNewPalmOil() {
  const transaction = {
    route: ['Palm Oil'],
    add: [createOneTrade()],
  }
  const res = gridOptions.api!.applyServerSideTransaction(transaction)
  console.log('New Palm Oil, result = ' + (res && res.status))
}

function onBtNewRubber() {
  const transaction = {
    route: ['Rubber'],
    add: [createOneTrade()],
  }
  const res = gridOptions.api!.applyServerSideTransaction(transaction)
  console.log('New Rubber, result = ' + (res && res.status))
}

function onBtNewWoolAmber() {
  const transactions = []
  transactions.push({
    route: ['Wool'],
    add: [createOneTrade()],
  })
  transactions.push({
    route: ['Amber'],
    add: [createOneTrade()],
  })

  const api = gridOptions.api!
  transactions.forEach(function (tx) {
    const res = api.applyServerSideTransaction(tx)
    console.log('New ' + tx.route[0] + ', result = ' + (res && res.status))
  })
}

function onBtNewProduct() {
  const transaction = {
    route: [],
    add: [{ id: idSequence++, productName: 'Rice', trades: [] }],
  }
  const res = gridOptions.api!.applyServerSideTransaction(transaction)
  console.log('New Product, result = ' + (res && res.status))
}

function onBtGroupLevelState() {
  const groupLevelState = gridOptions.api!.getServerSideGroupLevelState()
  console.log('Group Level States:')
  groupLevelState.forEach(function (state, index) {
    console.log(
      index +
      ' - ' +
      JSON.stringify(state).replace(/"/g, '').replace(/,/g, ', ')
    )
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
