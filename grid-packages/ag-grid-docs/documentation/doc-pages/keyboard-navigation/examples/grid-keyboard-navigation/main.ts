import { ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: ' ',
    headerCheckboxSelection: true,
    checkboxSelection: true,
    floatingFilter: false,
    suppressMenu: true,
    minWidth: 50,
    maxWidth: 50,
    width: 50,
    flex: 0,
    resizable: false,
    sortable: false,
    editable: false,
    filter: false,
    suppressColumnsToolPanel: true,
  },
  {
    headerName: 'Participant',
    children: [
      { field: 'athlete', minWidth: 170 },
      { field: 'country', minWidth: 150 },
    ],
  },
  { field: 'sport' },
  {
    headerName: 'Medals',
    children: [
      {
        field: 'total',
        columnGroupShow: 'closed',
        filterComp: 'agNumberColumnFilter',
        width: 120,
        flex: 0,
      },
      {
        field: 'gold',
        columnGroupShow: 'open',
        filterComp: 'agNumberColumnFilter',
        width: 100,
        flex: 0,
      },
      {
        field: 'silver',
        columnGroupShow: 'open',
        filterComp: 'agNumberColumnFilter',
        width: 100,
        flex: 0,
      },
      {
        field: 'bronze',
        columnGroupShow: 'open',
        filterComp: 'agNumberColumnFilter',
        width: 100,
        flex: 0,
      },
    ],
  },
  { field: 'year', filterComp: 'agNumberColumnFilter' },
]

const gridOptions: GridOptions = {
  rowData: null,
  columnDefs: columnDefs,
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  defaultColDef: {
    editable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    resizable: true,
    floatingFilter: true,
    flex: 1,
  },
  sideBar: {
    toolPanels: ['columns', 'filters'],
    defaultToolPanel: '',
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
