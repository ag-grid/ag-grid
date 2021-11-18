import { ColDef, GridOptions } from '@ag-grid-community/core'

var rowData = [
  { value: 14, type: 'age' },
  { value: 'Female', type: 'gender' },
  { value: 'Happy', type: 'mood' },
  { value: 21, type: 'age' },
  { value: 'Male', type: 'gender' },
  { value: 'Sad', type: 'mood' },
]

const columnDefs: ColDef[] = [
  {
    field: 'value',
    editable: true,
    cellEditorSelector: cellEditorSelector,
  },
  { field: 'type' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
  },
  rowData: rowData,

  components: {
    numericCellEditor: NumericCellEditor,
    moodEditor: MoodEditor,
  },

  onRowEditingStarted: onRowEditingStarted,
  onRowEditingStopped: onRowEditingStopped,
  onCellEditingStarted: onCellEditingStarted,
  onCellEditingStopped: onCellEditingStopped,
}

function onRowEditingStarted(event) {
  console.log('never called - not doing row editing')
}

function onRowEditingStopped(event) {
  console.log('never called - not doing row editing')
}

function onCellEditingStarted(event) {
  console.log('cellEditingStarted')
}

function onCellEditingStopped(event) {
  console.log('cellEditingStopped')
}

function cellEditorSelector(params) {
  if (params.data.type === 'age') {
    return {
      component: 'numericCellEditor',
    }
  }

  if (params.data.type === 'gender') {
    return {
      component: 'agRichSelectCellEditor',
      params: {
        values: ['Male', 'Female'],
      },
    }
  }

  if (params.data.type === 'mood') {
    return {
      component: 'moodEditor',
    }
  }

  return undefined
}

function getCharCodeFromEvent(event) {
  event = event || window.event
  return typeof event.which == 'undefined' ? event.keyCode : event.which
}

function isCharNumeric(charStr) {
  return !!/\d/.test(charStr)
}

function isKeyPressedNumeric(event) {
  var charCode = getCharCodeFromEvent(event)
  var charStr = String.fromCharCode(charCode)
  return isCharNumeric(charStr)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})
