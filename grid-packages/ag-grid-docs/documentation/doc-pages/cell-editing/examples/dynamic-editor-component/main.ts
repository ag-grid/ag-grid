import { Grid, CellEditingStartedEvent, CellEditingStoppedEvent, GridOptions, ICellEditorParams, RowEditingStartedEvent, RowEditingStoppedEvent } from '@ag-grid-community/core'
import { NumericCellEditor } from './numericCellEditor_typescript'
import { MoodEditor } from './moodEditor_typescript'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'value',
      editable: true,
      cellEditorCompSelector: cellEditorCompSelector,
      cellEditorPopup: true
    },
    { field: 'type' },
  ],
  defaultColDef: {
    flex: 1,
  },
  rowData: getData(),

  onRowEditingStarted: onRowEditingStarted,
  onRowEditingStopped: onRowEditingStopped,
  onCellEditingStarted: onCellEditingStarted,
  onCellEditingStopped: onCellEditingStopped,
}

function onRowEditingStarted(event: RowEditingStartedEvent) {
  console.log('never called - not doing row editing')
}

function onRowEditingStopped(event: RowEditingStoppedEvent) {
  console.log('never called - not doing row editing')
}

function onCellEditingStarted(event: CellEditingStartedEvent) {
  console.log('cellEditingStarted')
}

function onCellEditingStopped(event: CellEditingStoppedEvent) {
  console.log('cellEditingStopped')
}

function cellEditorCompSelector(params: ICellEditorParams) {
  if (params.data.type === 'age') {
    return {
      comp: NumericCellEditor,
    }
  }

  if (params.data.type === 'gender') {
    return {
      comp: 'agRichSelectCellEditor',
      params: {
        values: ['Male', 'Female'],
      },
    }
  }

  if (params.data.type === 'mood') {
    return {
      comp: MoodEditor,
    }
  }

  return undefined
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
