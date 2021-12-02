import { ColDef, GridOptions, ICellRendererParams, RowSpanParams } from '@ag-grid-community/core'

function rowSpan(params: RowSpanParams) {
  if (params.data.show) {
    return 4
  } else {
    return 1
  }
}

const columnDefs: ColDef[] = [
  { field: 'localTime' },
  {
    field: 'show',
    cellRenderer: 'showCellRenderer',
    rowSpan: rowSpan,
    cellClassRules: {
      'show-cell': 'value !== undefined',
    },
    width: 200,
  },
  { field: 'a' },
  { field: 'b' },
  { field: 'c' },
  { field: 'd' },
  { field: 'e' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    resizable: true,
    width: 170,
  },
  rowData: getData(),
  components: {
    showCellRenderer: createShowCellRenderer(),
  },
  suppressRowTransform: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})

function createShowCellRenderer() {

  class ShowCellRenderer {
    ui: any;

    init(params: ICellRendererParams) {
      var cellBlank = !params.value
      if (cellBlank) {
        return null
      }

      this.ui = document.createElement('div')
      this.ui.innerHTML =
        '<div class="show-name">' +
        params.value.name +
        '' +
        '</div>' +
        '<div class="show-presenter">' +
        params.value.presenter +
        '</div>'
    }
    getGui() {
      return this.ui;
    }
  }
  return ShowCellRenderer
}
