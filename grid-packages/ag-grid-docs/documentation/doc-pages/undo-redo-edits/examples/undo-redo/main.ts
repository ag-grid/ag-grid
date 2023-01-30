import { Grid, CellValueChangedEvent, GridOptions, UndoStartEvent, UndoEndEvent, RedoStartEvent, RedoEndEvent } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'a' },
    { field: 'b' },
    { field: 'c' },
    { field: 'd' },
    { field: 'e' },
    { field: 'f' },
    { field: 'g' },
    { field: 'h' },
  ],
  defaultColDef: {
    flex: 1,
    editable: true,
  },
  rowData: getRows(),
  enableRangeSelection: true,
  enableFillHandle: true,
  undoRedoCellEditing: true,
  undoRedoCellEditingLimit: 5,
  enableCellChangeFlash: true,
  onFirstDataRendered: onFirstDataRendered,
  onCellValueChanged: onCellValueChanged,
  onUndoStart: onUndoStart,
  onUndoEnd: onUndoEnd,
  onRedoStart: onRedoStart,
  onRedoEnd: onRedoEnd,
}

function undo() {
  gridOptions.api!.undoCellEditing()
}

function redo() {
  gridOptions.api!.redoCellEditing()
}

function onFirstDataRendered() {
  setValue('#undoInput', 0)
  disable('#undoInput', true)
  disable('#undoBtn', true)

  setValue('#redoInput', 0)
  disable('#redoInput', true)
  disable('#redoBtn', true)
}

function onCellValueChanged(params: CellValueChangedEvent) {
  console.log('cellValueChanged', params);

  var undoSize = params.api.getCurrentUndoSize()
  setValue('#undoInput', undoSize)
  disable('#undoBtn', undoSize < 1)

  var redoSize = params.api.getCurrentRedoSize()
  setValue('#redoInput', redoSize)
  disable('#redoBtn', redoSize < 1)
}

function onUndoStart(event: UndoStartEvent) {
  console.log('undoStart', event);
}

function onUndoEnd(event: UndoEndEvent) {
  console.log('undoEnd', event);
}

function onRedoStart(event: RedoStartEvent) {
  console.log('redoStart', event);
}

function onRedoEnd(event: RedoEndEvent) {
  console.log('redoEnd', event);
}

function disable(id: string, disabled: boolean) {
  (document.querySelector(id) as any).disabled = disabled
}

function setValue(id: string, value: number) {
  (document.querySelector(id) as any).value = value
}

function getRows() {
  return Array.apply(null, Array(100)).map(function (_, i) {
    return {
      a: 'a-' + i,
      b: 'b-' + i,
      c: 'c-' + i,
      d: 'd-' + i,
      e: 'e-' + i,
      f: 'f-' + i,
      g: 'g-' + i,
      h: 'h-' + i,
    }
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
