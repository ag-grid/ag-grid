import { Grid, GridOptions } from '@ag-grid-community/core'

var dateFilterParams = {
  filters: [
    {
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterDate: Date, cellValue: string) => {
          if (cellValue == null) return -1

          return getDate(cellValue).getTime() - filterDate.getTime()
        },
      },
    },
    {
      filter: 'agSetColumnFilter',
      filterParams: {
        comparator: (a: string, b: string) => {
          return getDate(a).getTime() - getDate(b).getTime()
        },
      },
    },
  ],
}

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', filter: 'agMultiColumnFilter' },
    {
      field: 'gold',
      filter: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filter: 'agNumberColumnFilter',
          },
          {
            filter: 'agSetColumnFilter',
          },
        ],
      },
    },
    {
      field: 'date',
      filter: 'agMultiColumnFilter',
      filterParams: dateFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    floatingFilter: true,
    menuTabs: ['filterMenuTab'],
  },
}

function getDate(value: string) {
  var dateParts = value.split('/')
  return new Date(
    Number(dateParts[2]),
    Number(dateParts[1]) - 1,
    Number(dateParts[0])
  )
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
