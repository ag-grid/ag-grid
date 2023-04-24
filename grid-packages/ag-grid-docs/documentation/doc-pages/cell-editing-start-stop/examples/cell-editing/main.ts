import { CellEditingStartedEvent, CellEditingStoppedEvent, Grid, GridOptions, RowEditingStartedEvent, RowEditingStoppedEvent, RowPinnedType } from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'firstName' },
    { field: 'lastName' },
    { field: 'gender' },
    { field: 'age' },
    { field: 'mood' },
    { field: 'country' },
    { field: 'address', minWidth: 550 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 110,
    editable: true,
    resizable: true,
  },
  rowData: getData(),
  pinnedTopRowData: getPinnedTopData(),
  pinnedBottomRowData: getPinnedBottomData(),
  onRowEditingStarted: (event: RowEditingStartedEvent) => {
    console.log('never called - not doing row editing')
  },
  onRowEditingStopped: (event: RowEditingStoppedEvent) => {
    console.log('never called - not doing row editing')
  },
  onCellEditingStarted: (event: CellEditingStartedEvent) => {
    console.log('cellEditingStarted')
  },
  onCellEditingStopped: (event: CellEditingStoppedEvent) => {
    console.log('cellEditingStopped')
  }
}

function getPinnedTopData() {
  return [
    {
      firstName: '##',
      lastName: '##',
      gender: '##',
      address: '##',
      mood: '##',
      country: '##',
    },
  ]
}

function getPinnedBottomData() {
  return [
    {
      firstName: '##',
      lastName: '##',
      gender: '##',
      address: '##',
      mood: '##',
      country: '##',
    },
  ]
}
function onBtStopEditing() {
  gridOptions.api!.stopEditing()
}

function onBtStartEditing(key?: string, char?: string, pinned?: RowPinnedType) {
  gridOptions.api!.setFocusedCell(0, 'lastName', pinned)

  gridOptions.api!.startEditingCell({
    rowIndex: 0,
    colKey: 'lastName',
    // set to 'top', 'bottom' or undefined
    rowPinned: pinned,
    key: key,
    charPress: char,
  })
}

function onBtNextCell() {
  gridOptions.api!.tabToNextCell()
}

function onBtPreviousCell() {
  gridOptions.api!.tabToPreviousCell()
}

function onBtWhich() {
  var cellDefs = gridOptions.api!.getEditingCells()
  if (cellDefs.length > 0) {
    var cellDef = cellDefs[0]
    console.log(
      'editing cell is: row = ' +
      cellDef.rowIndex +
      ', col = ' +
      cellDef.column.getId() +
      ', floating = ' +
      cellDef.rowPinned
    )
  } else {
    console.log('no cells are editing')
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
