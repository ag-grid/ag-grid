import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
declare var logos: any;

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'country' },
  { field: 'age' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
    resizable: true,
  },
  defaultExcelExportParams: {
    prependContent: [
      [
        {
          data: {
            type: 'String',
            value: logos.AgGrid, // see imageUtils
          },
          mergeAcross: 1,
        },
      ],
    ],
    rowHeight: params => (params.rowIndex === 1 ? 82 : 20),
    addImageToCell: (rowIndex, col, value) => {
      if (rowIndex !== 1 || col.getColId() !== 'athlete') {
        return
      }

      return {
        image: {
          id: 'logo',
          base64: value,
          imageType: 'png',
          width: 295,
          height: 100,
          position: {
            colSpan: 2,
          },
        },
      }
    },
  },
  onGridReady: params => {
    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
      .then(response => response.json())
      .then(data => params.api.setRowData(data))
  },
}

function onBtExport() {
  gridOptions.api!.exportDataAsExcel()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
