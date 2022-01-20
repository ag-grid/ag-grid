import {
  FirstDataRenderedEvent, Grid,
  GridOptions,
  ICellRendererParams,
  IFiltersToolPanel,
} from '@ag-grid-community/core'

var countryFilterParams = {
  cellRendererComp: countryCellRenderer,
}

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'No Cell Renderer',
      field: 'country',
      cellRendererComp: countryCellRenderer,
      filterComp: 'agSetColumnFilter',
      filterParams: {
        // no cell renderer!
      },
    },
    {
      headerName: 'With Cell Renderers',
      field: 'country',
      cellRendererComp: countryCellRenderer,
      filterComp: 'agSetColumnFilter',
      filterParams: countryFilterParams,
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

function countryCellRenderer(params: ICellRendererParams) {
  if (!params.value || params.value === '(Select All)') {
    return params.value
  }

  var url =
    'https://flags.fmcdn.net/data/flags/mini/' +
    COUNTRY_CODES[params.value] +
    '.png'
  var flagImage =
    '<img class="flag" border="0" width="15" height="10" src="' + url + '">'

  return flagImage + ' ' + params.value
}

function printFilterModel() {
  var filterModel = gridOptions.api!.getFilterModel()
  console.log(filterModel)
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
   ((params.api.getToolPanelInstance(
    'filters'
  ) as any) as IFiltersToolPanel).expandFilters()
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
