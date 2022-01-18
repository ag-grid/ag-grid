import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Row #',
      field: 'rowNumber',
      width: 120,
    },
    {
      field: 'autoA',
      width: 300,
      wrapText: true,
      autoHeight: true,
      headerName: 'A) Auto Height',
    },
    {
      width: 300,
      field: 'autoB',
      wrapText: true,
      headerName: 'B) Normal Height',
    },
  ],
  defaultColDef: {
    sortable: true,
    resizable: true,
  },
  onGridReady: function (params) {
    // in this example, the CSS styles are loaded AFTER the grid is created,
    // so we put this in a timeout, so height is calculated after styles are applied.
    setTimeout(function () {
      params.api.setRowData(getData())
    }, 500)
  },
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressSideButtons: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
    ],
    defaultToolPanel: 'columns',
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})


