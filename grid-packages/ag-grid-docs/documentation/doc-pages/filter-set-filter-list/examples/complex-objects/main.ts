import {
  FirstDataRenderedEvent, Grid,
  GridOptions,
  ISetFilterParams,
  KeyCreatorParams,
  ValueFormatterParams,
} from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      headerName: 'Country (Complex Object as Value)',
      field: 'country',
      valueFormatter: countryValueFormatter,
      filter: 'agSetColumnFilter',
      filterParams: {
        valueFormatter: countryValueFormatter,
        keyCreator: countryCodeKeyCreator,
      } as ISetFilterParams,
    },
    {
      headerName: 'Country (Complex Object as String)',
      field: 'country',
      valueFormatter: countryValueFormatter,
      filter: 'agSetColumnFilter',
      filterParams: {
        keyCreator: countryNameKeyCreator,
        convertValuesToStrings: true,
      } as ISetFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
    floatingFilter: true,
  },
  sideBar: 'filters',
  onFirstDataRendered: onFirstDataRendered,
}

function countryCodeKeyCreator(params: KeyCreatorParams) {
  var countryObject = params.value
  return countryObject.code
}

function countryNameKeyCreator(params: KeyCreatorParams) {
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
      // hack the data, replace each country with an object of country name and code.
      // also make country codes unique
      const uniqueCountryCodes: Map<string, string> = new Map();
      const newData: any[] = [];
      data.forEach(function (row: any) {
        const countryName = row.country;
        const countryCode = countryName.substring(0, 2).toUpperCase();
        const uniqueCountryName = uniqueCountryCodes.get(countryCode);
        if (!uniqueCountryName || uniqueCountryName === countryName) {
          uniqueCountryCodes.set(countryCode, countryName);
          row.country = {
            name: countryName,
            code: countryCode,
          };
          newData.push(row);
        }
      })

      gridOptions.api!.setRowData(newData)
    })
})
