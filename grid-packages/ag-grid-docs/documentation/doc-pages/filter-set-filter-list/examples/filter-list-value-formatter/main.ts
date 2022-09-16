import {
  FirstDataRenderedEvent, Grid,
  GridOptions,
  IFiltersToolPanel,
  ValueFormatterParams,
} from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      headerName: 'No Value Formatter',
      field: 'country',
      valueFormatter: countryValueFormatter,
      filter: 'agSetColumnFilter',
      filterParams: {
        // no value formatter!
      },
    },
    {
      headerName: 'With Value Formatter',
      field: 'country',
      valueFormatter: countryValueFormatter,
      filter: 'agSetColumnFilter',
      filterParams: {
        valueFormatter: countryValueFormatter,
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 225,
    resizable: true,
    floatingFilter: true,
  },
  sideBar: 'filters',
  onFirstDataRendered: onFirstDataRendered,
}

function countryValueFormatter(params: ValueFormatterParams) {
  var value = params.value
  return value + ' (' + COUNTRY_CODES[value].toUpperCase() + ')'
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
      // only return data that has corresponding country codes
      var dataWithFlags = data.filter(function (d: any) {
        return COUNTRY_CODES[d.country]
      })

      gridOptions.api!.setRowData(dataWithFlags)
    })
})

var COUNTRY_CODES: Record<string, string> = {
  Ireland: 'ie',
  Luxembourg: 'lu',
  Belgium: 'be',
  Spain: 'es',
  France: 'fr',
  Germany: 'de',
  Sweden: 'se',
  Italy: 'it',
  Greece: 'gr',
  Iceland: 'is',
  Portugal: 'pt',
  Malta: 'mt',
  Norway: 'no',
  Brazil: 'br',
  Argentina: 'ar',
  Colombia: 'co',
  Peru: 'pe',
  Venezuela: 've',
  Uruguay: 'uy',
}
