import { Grid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: 'Athlete Details',
    children: [
      {
        field: 'athlete',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'age',
        width: 90,
        filter: 'agNumberColumnFilter',
      },
      { headerName: 'Country', field: 'country', width: 140 },
    ],
  },
  {
    headerName: 'Sports Results',
    children: [
      { field: 'sport', width: 140 },
      {
        columnGroupShow: 'closed',
        field: 'total',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
      {
        columnGroupShow: 'open',
        field: 'gold',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
      {
        columnGroupShow: 'open',
        field: 'silver',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
      {
        columnGroupShow: 'open',
        field: 'bronze',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
    ],
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
  },
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
  defaultExcelExportParams: {
    allColumns: true
  }
}

function onBtExport() {
  gridOptions.api!.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
