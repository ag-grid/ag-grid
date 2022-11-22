import { Grid, ColDef, GridOptions, ISetFilter } from '@ag-grid-community/core'

declare var PersonFilter: any;

var dateFilterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    var dateAsString = cellValue
    if (dateAsString == null) return -1
    var dateParts = dateAsString.split('/')
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    )

    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0
    }

    if (cellDate < filterLocalDateAtMidnight) {
      return -1
    }

    if (cellDate > filterLocalDateAtMidnight) {
      return 1
    }
  },
  browserDatePicker: true,
}

const columnDefs: ColDef[] = [
  { field: 'athlete', filter: PersonFilter, suppressMenu: true },
  { field: 'age', filter: 'agNumberColumnFilter', suppressMenu: true },
  { field: 'country', filter: 'agSetColumnFilter', suppressMenu: true },
  {
    field: 'year',
    maxWidth: 120,
    filter: 'agNumberColumnFilter',
    floatingFilter: false,
  },
  {
    field: 'date',
    minWidth: 215,
    filter: 'agDateColumnFilter',
    filterParams: dateFilterParams,
    suppressMenu: true,
  },
  { field: 'sport', suppressMenu: true, filter: 'agTextColumnFilter' },
  {
    field: 'gold',
    filter: 'agNumberColumnFilter',
    filterParams: {
      buttons: ['apply'],
    },
    suppressMenu: true,
  },
  {
    field: 'silver',
    filter: 'agNumberColumnFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  {
    field: 'bronze',
    filter: 'agNumberColumnFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  { field: 'total', filter: false },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
    floatingFilter: true,
  },
}

function irelandAndUk() {
  var countryFilterComponent = gridOptions.api!.getFilterInstance('country')!
  countryFilterComponent.setModel({ values: ['Ireland', 'Great Britain'] })
  gridOptions.api!.onFilterChanged()
}

function clearCountryFilter() {
  var countryFilterComponent = gridOptions.api!.getFilterInstance('country')!
  countryFilterComponent.setModel(null)
  gridOptions.api!.onFilterChanged()
}

function destroyCountryFilter() {
  gridOptions.api!.destroyFilter('country')
}

function endingStan() {
  var countryFilterComponent = gridOptions.api!.getFilterInstance<ISetFilter>('country')!;
  var countriesEndingWithStan = countryFilterComponent
    .getFilterKeys()
    .filter(function (value: any) {
      return value.indexOf('stan') === value.length - 4
    })

  countryFilterComponent.setModel({ values: countriesEndingWithStan })
  gridOptions.api!.onFilterChanged()
}

function printCountryModel() {
  var countryFilterComponent = gridOptions.api!.getFilterInstance('country')!
  var model = countryFilterComponent.getModel()

  if (model) {
    console.log('Country model is: ' + JSON.stringify(model))
  } else {
    console.log('Country model filter is not active')
  }
}

function sportStartsWithS() {
  var sportsFilterComponent = gridOptions.api!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    type: 'startsWith',
    filter: 's',
  })

  gridOptions.api!.onFilterChanged()
}

function sportEndsWithG() {
  var sportsFilterComponent = gridOptions.api!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    type: 'endsWith',
    filter: 'g',
  })

  gridOptions.api!.onFilterChanged()
}

function sportsCombined() {
  var sportsFilterComponent = gridOptions.api!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    condition2: {
      type: 'endsWith',
      filter: 'g',
    },
    operator: 'AND',
    condition1: {
      type: 'startsWith',
      filter: 's',
    },
  })

  gridOptions.api!.onFilterChanged()
}

function ageBelow25() {
  var ageFilterComponent = gridOptions.api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'lessThan',
    filter: 25,
    filterTo: null,
  })

  gridOptions.api!.onFilterChanged()
}

function ageAbove30() {
  var ageFilterComponent = gridOptions.api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'greaterThan',
    filter: 30,
    filterTo: null,
  })

  gridOptions.api!.onFilterChanged()
}

function ageBelow25OrAbove30() {
  var ageFilterComponent = gridOptions.api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    condition1: {
      type: 'greaterThan',
      filter: 30,
      filterTo: null,
    },
    operator: 'OR',
    condition2: {
      type: 'lessThan',
      filter: 25,
      filterTo: null,
    },
  })

  gridOptions.api!.onFilterChanged()
}

function ageBetween25And30() {
  var ageFilterComponent = gridOptions.api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'inRange',
    filter: 25,
    filterTo: 30,
  })

  gridOptions.api!.onFilterChanged()
}

function clearAgeFilter() {
  var ageFilterComponent = gridOptions.api!.getFilterInstance('age')!
  ageFilterComponent.setModel(null)
  gridOptions.api!.onFilterChanged()
}

function after2010() {
  var dateFilterComponent = gridOptions.api!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    type: 'greaterThan',
    dateFrom: '2010-01-01',
    dateTo: null,
  })

  gridOptions.api!.onFilterChanged()
}

function before2012() {
  var dateFilterComponent = gridOptions.api!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    type: 'lessThan',
    dateFrom: '2012-01-01',
    dateTo: null,
  })

  gridOptions.api!.onFilterChanged()
}

function dateCombined() {
  var dateFilterComponent = gridOptions.api!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    condition1: {
      type: 'lessThan',
      dateFrom: '2012-01-01',
      dateTo: null,
    },
    operator: 'OR',
    condition2: {
      type: 'greaterThan',
      dateFrom: '2010-01-01',
      dateTo: null,
    },
  })

  gridOptions.api!.onFilterChanged()
}

function clearDateFilter() {
  var dateFilterComponent = gridOptions.api!.getFilterInstance('date')!
  dateFilterComponent.setModel(null)
  gridOptions.api!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
