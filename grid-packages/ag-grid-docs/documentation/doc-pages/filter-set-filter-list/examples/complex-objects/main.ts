import {
  FirstDataRenderedEvent, Grid,
  GridOptions,
  IFiltersToolPanel,
  KeyCreatorParams,
  ValueFormatterParams,
} from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      headerName: 'Country (Complex Object)',
      field: 'country',
      keyCreator: countryKeyCreator,
      valueFormatter: countryValueFormatter,
      filter: 'agSetColumnFilter',
    },
  ],
  defaultColDef: {
    flex: 1,
    floatingFilter: true,
  },
  sideBar: 'filters',
  onFirstDataRendered: onFirstDataRendered,
}

function countryKeyCreator(params: KeyCreatorParams) {
  var countryObject = params.value
  return countryObject.name
}

function countryValueFormatter(params: ValueFormatterParams) {
  return params.value.name
}

function printFilterModel() {
  var filterModel = gridOptions.api!.getFilterModel()
  console.log(filterModel)
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      // hack the data, replace each country with an object of country name and code
      data.forEach(function (row: any) {
        var countryName = row.country
        var countryCode = countryName.substring(0, 2).toUpperCase()
        row.country = {
          name: countryName,
          code: countryCode,
        }
      })

      gridOptions.api!.setRowData(data)
    })
})
