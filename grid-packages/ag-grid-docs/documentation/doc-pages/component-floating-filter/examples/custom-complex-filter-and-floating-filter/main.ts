import { ColDef, GridOptions } from '@ag-grid-community/core'

declare var NumberFilter: any
declare var NumberFloatingFilter: any

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    minWidth: 150,
    filter: 'agTextColumnFilter',
    filterParams: {
      debounceMs: 2000,
    },
  },
  {
    field: 'age',
    filter: 'agNumberColumnFilter',
    filterParams: {
      debounceMs: 0,
    },
  },
  { field: 'country' },
  { field: 'year' },
  {
    field: 'date',
    minWidth: 180,
    filter: 'date',
    filterParams: {
      comparator: function (
        filterLocalDateAtMidnight: Date,
        cellValue: string
      ) {
        var dateAsString = cellValue
        var dateParts = dateAsString.split('/')
        var cellDate = new Date(
          Number(dateParts[2]),
          Number(dateParts[1]) - 1,
          Number(dateParts[0])
        )

        if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
          return 0
        }

        if (cellDate < filterLocalDateAtMidnight) {
          return -1
        }

        if (cellDate > filterLocalDateAtMidnight) {
          return 1
        }
      },
    },
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  { field: 'sport' },
  {
    field: 'gold',
    floatingFilterComponent: 'numberFloatingFilter',
    floatingFilterComponentParams: {
      maxValue: 7,
      suppressFilterButton: true,
    },
    filter: 'numberFilter',
  },
  {
    field: 'silver',
    floatingFilterComponent: 'numberFloatingFilter',
    floatingFilterComponentParams: {
      maxValue: 3,
      suppressFilterButton: true,
    },
    filter: 'numberFilter',
  },
  {
    field: 'bronze',
    floatingFilterComponent: 'numberFloatingFilter',
    floatingFilterComponentParams: {
      maxValue: 2,
      suppressFilterButton: true,
    },
    filter: 'numberFilter',
  },
  {
    field: 'total',
    floatingFilterComponent: 'numberFloatingFilter',
    floatingFilterComponentParams: {
      maxValue: 5,
      suppressFilterButton: true,
    },
    filter: 'numberFilter',
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
    resizable: true,
  },
  components: {
    numberFloatingFilter: NumberFloatingFilter,
    numberFilter: NumberFilter,
  },
  columnDefs: columnDefs,
  rowData: null,
}

function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(parseFloat(n))
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
