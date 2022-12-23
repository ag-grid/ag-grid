import { Grid, ColDef, GridOptions, IDateFilterParams } from '@ag-grid-community/core'
import { PersonFilter } from './personFilter_typescript'
import { YearFilter } from './yearFilter_typescript'

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 150, filter: PersonFilter },
  { field: 'age', filter: 'agNumberColumnFilter' },
  { field: 'country', minWidth: 150 },
  { field: 'year', filter: YearFilter },
  {
    field: 'date',
    minWidth: 130,
    filter: 'agDateColumnFilter',
    filterParams: {
      comparator: function (
        filterLocalDateAtMidnight: Date,
        cellValue: string
      ) {
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
    } as IDateFilterParams,
  },
  { field: 'sport' },
  { field: 'gold', filter: 'agNumberColumnFilter' },
  { field: 'silver', filter: 'agNumberColumnFilter' },
  { field: 'bronze', filter: 'agNumberColumnFilter' },
  { field: 'total', filter: 'agNumberColumnFilter' },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
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
