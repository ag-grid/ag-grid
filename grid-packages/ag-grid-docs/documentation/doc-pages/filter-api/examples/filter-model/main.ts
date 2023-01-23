import { Grid, ColDef, GridOptions, IDateFilterParams } from '@ag-grid-community/core'

var filterParams: IDateFilterParams = {
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
  },
  // browserDatePicker: true,
}

const columnDefs: ColDef[] = [
  { field: 'athlete', filter: 'agTextColumnFilter' },
  { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 100 },
  { field: 'country' },
  { field: 'year', maxWidth: 100 },
  {
    field: 'date',
    filter: 'agDateColumnFilter',
    filterParams: filterParams,
  },
  { field: 'sport' },
  { field: 'gold', filter: 'agNumberColumnFilter' },
  { field: 'silver', filter: 'agNumberColumnFilter' },
  { field: 'bronze', filter: 'agNumberColumnFilter' },
  { field: 'total', filter: 'agNumberColumnFilter' },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
  },
  sideBar: 'filters',
  onGridReady: (params) => {
    params.api.getToolPanelInstance('filters')!.expandFilters()
  },
}

var savedFilterModel: any = null

function clearFilters() {
  gridOptions.api!.setFilterModel(null)
}

function saveFilterModel() {
  savedFilterModel = gridOptions.api!.getFilterModel()

  var keys = Object.keys(savedFilterModel)
  var savedFilters: string = keys.length > 0 ? keys.join(', ') : '(none)';

  (document.querySelector('#savedFilters') as any).innerHTML = savedFilters
}

function restoreFilterModel() {
  gridOptions.api!.setFilterModel(savedFilterModel)
}

function restoreFromHardCoded() {
  var hardcodedFilter = {
    country: {
      type: 'set',
      values: ['Ireland', 'United States'],
    },
    age: { type: 'lessThan', filter: '30' },
    athlete: { type: 'startsWith', filter: 'Mich' },
    date: { type: 'lessThan', dateFrom: '2010-01-01' },
  }

  gridOptions.api!.setFilterModel(hardcodedFilter)
}

function destroyFilter() {
  gridOptions.api!.destroyFilter('athlete');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
