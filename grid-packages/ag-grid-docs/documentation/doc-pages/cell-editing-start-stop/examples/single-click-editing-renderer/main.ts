import { Grid, GridOptions, ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 180 },
    { field: 'age' },
    { field: 'country', minWidth: 160 },
    { field: 'year' },
    { field: 'date', minWidth: 160 },
    { field: 'sport', minWidth: 180 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
    // we use a cell renderer to include a button, so when the button
    // gets clicked, the editing starts.
    cellRenderer: getRenderer(),
  },
  // set the bottom grid to no click editing
  suppressClickEdit: true
}

function getRenderer() {
  class CellRenderer implements ICellRendererComp {
    eGui: any
    eButton: any
    params!: ICellRendererParams
    buttonClickListener!: () => void

    createGui() {
      const template =
        '<span><button id="theButton" style="height: 39px">#</button><span id="theValue" style="padding-left: 4px;"></span></span>'
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = template
      this.eGui = tempDiv.firstElementChild
    }

    init(params: ICellRendererParams) {
      // create the gui
      this.createGui()
      // keep params, we use it in onButtonClicked
      this.params = params

      // attach the value to the value span
      const eValue = this.eGui.querySelector('#theValue')

      eValue.innerHTML = params.value
      // setup the button, first get reference to it
      this.eButton = this.eGui.querySelector('#theButton')

      // bind the listener so 'this' is preserved, also keep reference to it for removal
      this.buttonClickListener = this.onButtonClicked.bind(this)
      // add the listener
      this.eButton.addEventListener('click', this.buttonClickListener)
    }
    onButtonClicked() {
      // start editing this cell. see the docs on the params that this method takes
      const startEditingParams = {
        rowIndex: this.params.rowIndex,
        colKey: this.params.column!.getId(),
      }
      this.params.api.startEditingCell(startEditingParams)
    }
    getGui() {
      // returns our gui to the grid for this cell
      return this.eGui
    }
    refresh() {
      return false;
    }
    destroy() {
      // be good, clean up the listener
      this.eButton.removeEventListener('click', this.buttonClickListener)
    }
  }

  return CellRenderer
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
