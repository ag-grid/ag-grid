import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  IDateFilterParams,
  IMultiFilterParams,
  IProvidedFilterParams,
  ISetFilter,
  ITextFilterParams,
  ISetFilterParams,
} from '@ag-grid-community/core';

declare var dateComparator: any;
var defaultFilterParams: IProvidedFilterParams = { readOnly: true }

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    filter: 'agTextColumnFilter',
    filterParams: defaultFilterParams
  },
  {
    field: 'age',
    filter: 'agNumberColumnFilter',
    filterParams: defaultFilterParams,
  },
  {
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: defaultFilterParams,
  },
  {
    field: 'year',
    maxWidth: 120,
    filter: 'agNumberColumnFilter',
    filterParams: defaultFilterParams,
  },
  {
    field: 'date',
    minWidth: 215,
    filter: 'agDateColumnFilter',
    filterParams: {
      readOnly: true,
      comparator: dateComparator,
    } as IDateFilterParams,
    suppressMenu: true,
  },
  {
    field: 'sport',
    suppressMenu: true,
    filter: 'agMultiColumnFilter',
    filterParams: {
      filters: [
        { filter: 'agTextColumnFilter', filterParams: { readOnly: true } as ITextFilterParams },
        { filter: 'agSetColumnFilter', filterParams: { readOnly: true } as ISetFilterParams },
      ],
      readOnly: true,
    } as IMultiFilterParams,
  },
  { field: 'gold', filterParams: defaultFilterParams },
  { field: 'silver', filterParams: defaultFilterParams },
  { field: 'bronze', filterParams: defaultFilterParams },
  { field: 'total', filter: false },
]

let api: GridApi<IOlympicData>;

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
  var countryFilterComponent = api!.getFilterInstance('country')!
  countryFilterComponent.setModel({ values: ['Ireland', 'Great Britain'] })
  api!.onFilterChanged()
}

function clearCountryFilter() {
  var countryFilterComponent = api!.getFilterInstance('country')!
  countryFilterComponent.setModel(null)
  api!.onFilterChanged()
}

function destroyCountryFilter() {
  api!.destroyFilter('country')
}

function endingStan() {
  var countryFilterComponent = api!.getFilterInstance<ISetFilter>('country')!;
  var countriesEndingWithStan = countryFilterComponent
    .getFilterKeys()
    .filter(function (value: any) {
      return value.indexOf('stan') === value.length - 4
    })

  countryFilterComponent.setModel({ values: countriesEndingWithStan })
  api!.onFilterChanged()
}

function printCountryModel() {
  var countryFilterComponent = api!.getFilterInstance('country')!
  var model = countryFilterComponent.getModel()

  if (model) {
    console.log('Country model is: ' + JSON.stringify(model))
  } else {
    console.log('Country model filter is not active')
  }
}

function sportStartsWithS() {
  var sportsFilterComponent = api!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    filterModels: [
      {
        type: 'startsWith',
        filter: 's',
      },
    ],
  })

  api!.onFilterChanged()
}

function sportEndsWithG() {
  var sportsFilterComponent = api!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    filterModels: [
      {
        type: 'endsWith',
        filter: 'g',
      },
    ],
  })

  api!.onFilterChanged()
}

function sportsCombined() {
  var sportsFilterComponent = api!.getFilterInstance('sport')!
  sportsFilterComponent.setModel({
    filterModels: [
      {
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
      },
    ],
  })

  api!.onFilterChanged()
}

function ageBelow25() {
  var ageFilterComponent = api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'lessThan',
    filter: 25,
    filterTo: null,
  })

  api!.onFilterChanged()
}

function ageAbove30() {
  var ageFilterComponent = api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'greaterThan',
    filter: 30,
    filterTo: null,
  })

  api!.onFilterChanged()
}

function ageBelow25OrAbove30() {
  var ageFilterComponent = api!.getFilterInstance('age')!
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

  api!.onFilterChanged()
}

function ageBetween25And30() {
  var ageFilterComponent = api!.getFilterInstance('age')!
  ageFilterComponent.setModel({
    type: 'inRange',
    filter: 25,
    filterTo: 30,
  })

  api!.onFilterChanged()
}

function clearAgeFilter() {
  var ageFilterComponent = api!.getFilterInstance('age')!
  ageFilterComponent.setModel(null)
  api!.onFilterChanged()
}

function after2010() {
  var dateFilterComponent = api!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    type: 'greaterThan',
    dateFrom: '2010-01-01',
    dateTo: null,
  })

  api!.onFilterChanged()
}

function before2012() {
  var dateFilterComponent = api!.getFilterInstance('date')!
  dateFilterComponent.setModel({
    type: 'lessThan',
    dateFrom: '2012-01-01',
    dateTo: null,
  })

  api!.onFilterChanged()
}

function dateCombined() {
  var dateFilterComponent = api!.getFilterInstance('date')!
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

  api!.onFilterChanged()
}

function clearDateFilter() {
  var dateFilterComponent = api!.getFilterInstance('date')!
  dateFilterComponent.setModel(null)
  api!.onFilterChanged()
}

function clearSportFilter() {
  var dateFilterComponent = api!.getFilterInstance('sport')!
  dateFilterComponent.setModel(null)
  api!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
