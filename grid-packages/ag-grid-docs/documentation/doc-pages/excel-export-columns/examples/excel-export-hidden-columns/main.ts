import { Grid, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColGroupDef[] = [
  {
    headerName: 'Top Level Column Group',
    children: [
      {
        headerName: 'Group A',
        children: [
          { field: 'athlete', minWidth: 200 },
          { field: 'country', minWidth: 200 },
          { headerName: 'Group', valueGetter: 'data.country.charAt(0)' },
        ],
      },
      {
        headerName: 'Group B',
        children: [
          { field: 'sport', minWidth: 150 },
          { field: 'gold', hide: true },
          { field: 'silver', hide: true },
          { field: 'bronze', hide: true },
          { field: 'total', hide: true },
        ],
      },
    ],
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },

  popupParent: document.body,
}

function getBoolean(id: string) {
  return !!(document.querySelector('#' + id) as HTMLInputElement).checked
}

function getParams() {
  return {
    allColumns: getBoolean('allColumns'),
  }
}

function onBtExport() {
  gridOptions.api!.exportDataAsExcel(getParams())
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(response => response.json())
    .then(data =>
      gridOptions.api!.setRowData(data.filter((rec: any) => rec.country != null))
    )
})
