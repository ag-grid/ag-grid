import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
import { CustomDateComponent } from './customDateComponent_typescript'

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
  { field: 'age', filter: 'agNumberColumnFilter' },
  { field: 'country' },
  { field: 'year' },
  {
    field: 'date',
    minWidth: 190,
    filter: 'agDateColumnFilter',
    filterParams: filterParams,
  },
  { field: 'sport' },
  { field: 'gold', filter: 'agNumberColumnFilter' },
  { field: 'silver', filter: 'agNumberColumnFilter' },
  { field: 'bronze', filter: 'agNumberColumnFilter' },
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
  components: {
    agDateInput: CustomDateComponent,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
