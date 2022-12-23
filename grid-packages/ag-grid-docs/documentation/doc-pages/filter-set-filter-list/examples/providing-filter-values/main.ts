import {
  FirstDataRenderedEvent, Grid,
  GridOptions,
  ISetFilterParams,
} from '@ag-grid-community/core'

var listOfDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

var daysValuesNotProvidedFilterParams: ISetFilterParams = {
  comparator: (a: string | null, b: string | null) => {
    var aIndex = a == null ? -1 : listOfDays.indexOf(a)
    var bIndex = b == null ? -1 : listOfDays.indexOf(b)
    if (aIndex === bIndex) return 0
    return aIndex > bIndex ? 1 : -1
  },
}

var daysValuesProvidedFilterParams: ISetFilterParams = {
  values: listOfDays,
  suppressSorting: true, // use provided order
}

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Days (Values Not Provided)',
      field: 'days',
      filter: 'agSetColumnFilter',
      filterParams: daysValuesNotProvidedFilterParams,
    },
    {
      headerName: 'Days (Values Provided)',
      field: 'days',
      filter: 'agSetColumnFilter',
      filterParams: daysValuesProvidedFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
    filter: true,
    resizable: true,
  },
  sideBar: 'filters',
  rowData: getRowData(),
  onFirstDataRendered: onFirstDataRendered,
}

function getRowData() {
  var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  var rows = []
  for (var i = 0; i < 200; i++) {
    var index = Math.floor(Math.random() * 5)
    rows.push({ days: weekdays[index] })
  }

  return rows
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
