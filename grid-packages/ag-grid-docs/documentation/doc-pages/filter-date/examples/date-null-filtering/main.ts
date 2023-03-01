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
  includeBlanksInEquals: false,
  includeBlanksInLessThan: false,
  includeBlanksInGreaterThan: false,
  includeBlanksInRange: false,
};

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  {
    field: 'date',
    filter: 'agDateColumnFilter',
    filterParams: filterParams,
  },
  {
    headerName: 'Description',
    valueGetter: '"Date is " + data.date',
    minWidth: 340,
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
}

function changeNull(toChange: string, value: boolean) {
  switch (toChange) {
    case 'equals':
      columnDefs[1].filterParams.includeBlanksInEquals = value
      break
    case 'lessThan':
      columnDefs[1].filterParams.includeBlanksInLessThan = value
      break
    case 'greaterThan':
      columnDefs[1].filterParams.includeBlanksInGreaterThan = value
      break
    case 'inRange':
      columnDefs[1].filterParams.includeBlanksInRange = value
      break
  }

  var filterModel = gridOptions.api!.getFilterModel()

  gridOptions.api!.setColumnDefs(columnDefs)
  gridOptions.api!.destroyFilter('date')
  gridOptions.api!.setFilterModel(filterModel)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  gridOptions.api!.setRowData([
    {
      athlete: 'Alberto Gutierrez',
      date: null,
    },
    {
      athlete: 'Niall Crosby',
      date: undefined,
    },
    {
      athlete: 'Sean Landsman',
      date: '25/10/2016',
    },
    {
      athlete: 'Robert Clarke',
      date: '25/10/2016',
    },
  ])
})
