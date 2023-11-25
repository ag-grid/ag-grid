import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  ISetFilter,
  IDateFilterParams,
  INumberFilterParams,
} from '@ag-grid-community/core';

var dateFilterParams: IDateFilterParams = {
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
    return 0;
  }
}

const columnDefs: ColDef[] = [
  { field: 'athlete', filter: 'agTextColumnFilter', suppressMenu: true },
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
    } as INumberFilterParams,
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

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    floatingFilter: true,
  },
}

function irelandAndUk() {
  var countryFilterComponent = gridApi!.getFilterInstance('country')!
  countryFilterComponent.setModel({ values: ['Ireland', 'Great Britain'] })
  gridApi!.onFilterChanged()
}

function clearCountryFilter() {
  var countryFilterComponent = gridApi!.getFilterInstance('country')!
  countryFilterComponent.setModel(null)
  gridApi!.onFilterChanged()
}

function destroyCountryFilter() {
  gridApi!.destroyFilter('country')
}

function endingStan() {
  var countryFilterComponent = gridApi!.getFilterInstance<ISetFilter>('country')!;
  var countriesEndingWithStan = countryFilterComponent
    .getFilterKeys()
    .filter(function (value: any) {
      return value.indexOf('stan') === value.length - 4
    })

  countryFilterComponent.setModel({ values: countriesEndingWithStan })
  gridApi!.onFilterChanged()
}

function printCountryModel() {
  var countryFilterComponent = gridApi!.getFilterInstance('country')!
  var model = countryFilterComponent.getModel()

  if (model) {
    console.log('Country model is: ' + JSON.stringify(model))
  } else {
    console.log('Country model filter is not active')
  }
}

function sportStartsWithS() {
  var sportsFilterComponent = gridApi!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    type: 'startsWith',
    filter: 's',
  })

  gridApi!.onFilterChanged()
}

function sportEndsWithG() {
  var sportsFilterComponent = gridApi!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    type: 'endsWith',
    filter: 'g',
  })

  gridApi!.onFilterChanged()
}

function sportsCombined() {
  var sportsFilterComponent = gridApi!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    conditions: [
      {
        type: 'endsWith',
        filter: 'g',
      },
      {
        type: 'startsWith',
        filter: 's',
      },
    ],
    operator: 'AND',
  })

  gridApi!.onFilterChanged()
}

function ageBelow25() {
  var ageFilterComponent = gridApi!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'lessThan',
    filter: 25,
    filterTo: null,
  })

  gridApi!.onFilterChanged()
}

function ageAbove30() {
  var ageFilterComponent = gridApi!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'greaterThan',
    filter: 30,
    filterTo: null,
  })

  gridApi!.onFilterChanged()
}

function ageBelow25OrAbove30() {
  var ageFilterComponent = gridApi!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    conditions: [
      {
        type: 'greaterThan',
        filter: 30,
        filterTo: null,
      },
      {
        type: 'lessThan',
        filter: 25,
        filterTo: null,
      },
    ],
    operator: 'OR',
  })

  gridApi!.onFilterChanged()
}

function ageBetween25And30() {
  var ageFilterComponent = gridApi!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'inRange',
    filter: 25,
    filterTo: 30,
  })

  gridApi!.onFilterChanged()
}

function clearAgeFilter() {
  var ageFilterComponent = gridApi!.getFilterInstance('age')!
  ageFilterComponent.setModel(null)
  gridApi!.onFilterChanged()
}

function after2010() {
  var dateFilterComponent = gridApi!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    type: 'greaterThan',
    dateFrom: '2010-01-01',
    dateTo: null,
  })

  gridApi!.onFilterChanged()
}

function before2012() {
  var dateFilterComponent = gridApi!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    type: 'lessThan',
    dateFrom: '2012-01-01',
    dateTo: null,
  })

  gridApi!.onFilterChanged()
}

function dateCombined() {
  var dateFilterComponent = gridApi!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    conditions: [
      {
        type: 'lessThan',
        dateFrom: '2012-01-01',
        dateTo: null,
      },
      {
        type: 'greaterThan',
        dateFrom: '2010-01-01',
        dateTo: null,
      },
    ],
    operator: 'OR',
  })

  gridApi!.onFilterChanged()
}

function clearDateFilter() {
  var dateFilterComponent = gridApi!.getFilterInstance('date')!
  dateFilterComponent.setModel(null)
  gridApi!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
