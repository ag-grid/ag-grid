import { Grid, GridOptions, IDateFilterParams, ISetFilterParams } from '@ag-grid-community/core'

const dateFilterParams: IDateFilterParams = {
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
  minValidYear: 2000,
  maxValidYear: 2021,
  inRangeFloatingFilterDateFormat: 'Do MMM YYYY',
}

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'country',
      rowGroup: true,
      filter: 'agTextColumnFilter',
    },
    { field: 'year', rowGroup: true },
    {
      field: 'athlete',
      rowGroup: true,
      filter: false,
    },
    {
      field: 'age',
      headerName: 'Age',
      filter: 'agMultiColumnFilter'
    },
    {
      field: 'date',
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
    },
    { field: 'gold', filter: 'agNumberColumnFilter' },
    {
      field: 'silver',
      filterParams: { excelMode: 'windows' } as ISetFilterParams,
    },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    enableRowGroup: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
    filter: 'agGroupColumnFilter',
  },
  animateRows: true,
  rowGroupPanelShow: 'always',
  sideBar: 'filters',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
