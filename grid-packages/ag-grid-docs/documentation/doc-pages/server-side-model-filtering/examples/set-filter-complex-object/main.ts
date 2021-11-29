import { ColDef, GridOptions, IServerSideDatasource, IServerSideGetRowsRequest, SetFilterValuesFuncParams, ValueFormatterParams } from '@ag-grid-community/core'

declare function getCountryMap(): Record<string, string>;
declare function getCountryCodeMap(): Record<string, string>;

const columnDefs: ColDef[] = [
  {
    field: 'country',
    valueFormatter: countryValueFormatter,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: getCountryValuesAsync,
      valueFormatter: countryFilterValueFormatter,
    },
    menuTabs: ['filterMenuTab'],
  },
  { field: 'athlete', menuTabs: undefined },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    sortable: true,
  },
  rowModelType: 'serverSide',
  serverSideStoreType: 'partial',
  animateRows: true,
}

function countryValueFormatter(params: ValueFormatterParams) {
  if (params.value && params.value.code) {
    return params.value.name + '(' + params.value.code + ')'
  }
  return '';
}

function getCountryValuesAsync(params: SetFilterValuesFuncParams) {
  setTimeout(function () {
    params.success(Object.keys(getCountryCodeMap()))
  }, 500)
}

function countryFilterValueFormatter(params: ValueFormatterParams) {
  var code = params.value
  var name = getCountryCodeMap()[code]
  return name + '(' + code + ')'
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      var fakeServer = getFakeServer(data)
      var datasource = getServerSideDatasource(fakeServer)
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: function (params) {
      console.log('[Datasource] - rows requested: ', params.request)

      var response = server.getData(params.request)

      // adding delay to simulate real server call
      setTimeout(function () {
        if (response.success) {
          // call the success callback
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          // inform the grid request failed
          params.fail()
        }
      }, 500)
    },
  }
}

function getFakeServer(allData: any[]) {
  // patch country data to use complex object
  allData.forEach(function (d) {
    d.country = {
      code: getCountryMap()[d.country],
      name: d.country,
    }
  })

  function doFilter(data: any[], filterModel: any) {
    var filterPresent = filterModel && Object.keys(filterModel).length > 0
    if (!filterPresent) return data
    return data.filter(function (d) {
      return filterModel.country.values.indexOf(d.country.code) > -1
    })
  }

  function doSort(data: any[], sortModel: any) {
    var sortPresent = sortModel && sortModel.length > 0
    if (!sortPresent) return data

    var sortedData = data.slice()
    sortedData.sort(function (a, b) {
      for (var k = 0; k < sortModel.length; k++) {
        var sortColModel = sortModel[k]

        var valueA = a[sortColModel.colId]
        if (valueA instanceof Object) {
          valueA = valueA.name
        }

        var valueB = b[sortColModel.colId]
        if (valueB instanceof Object) {
          valueB = valueB.name
        }

        if (valueA === valueB) {
          continue
        }
        var sortDirection = sortColModel.sort === 'asc' ? 1 : -1
        return valueA > valueB ? sortDirection : sortDirection * -1
      }
      return 0
    })
    return sortedData
  }

  return {
    getData: function (request: IServerSideGetRowsRequest) {
      var filteredData = doFilter(allData, request.filterModel)
      var filteredAndSortedData = doSort(filteredData, request.sortModel)

      // take a slice of the rows for requested block
      var rowsForBlock = filteredAndSortedData.slice(
        request.startRow,
        request.endRow
      )

      // if on or after the last page, work out the last row.
      var lastRow = allData.length <= (request.endRow || 0) ? allData.length : -1

      return {
        success: true,
        rows: rowsForBlock,
        lastRow: lastRow,
      }
    },
  }
}
