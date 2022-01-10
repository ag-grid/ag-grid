import { ColDef, GridOptions } from '@ag-grid-community/core'

declare var CustomDateComponent: any

const filterParams = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    const dateAsString = cellValue
    const dateParts = dateAsString.split('/')
    const cellDate = new Date(
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
}

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'age', filterComp: 'agNumberColumnFilter' },
  { field: 'country' },
  { field: 'year' },
  {
    field: 'date',
    minWidth: 190,
    filterComp: 'agDateColumnFilter',
    filterParams: filterParams,
  },
  { field: 'sport' },
  { field: 'gold', filterComp: 'agNumberColumnFilter' },
  { field: 'silver', filterComp: 'agNumberColumnFilter' },
  { field: 'bronze', filterComp: 'agNumberColumnFilter' },
  { field: 'total', filter: false },
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
  columnDefs: columnDefs,
  rowData: null,
  // Here is where we specify the component to be used as the date picker widget
  components: {
    agDateInput: CustomDateComponent,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
