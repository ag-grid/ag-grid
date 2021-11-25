import { CellValueChangedEvent, GridOptions, ICellEditorParams, RowValueChangedEvent } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'make',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC'],
      },
    },
    { field: 'model' },
    { field: 'field4', headerName: 'Read Only', editable: false },
    { field: 'price', cellEditor: 'numericCellEditor' },
    {
      headerName: 'Suppress Navigable',
      field: 'field5',
      suppressNavigable: true,
      minWidth: 200,
    },
    { headerName: 'Read Only', field: 'field6', editable: false },
  ],
  defaultColDef: {
    flex: 1,
    editable: true,
  },
  components: {
    numericCellEditor: getNumericCellEditor(),
  },
  editType: 'fullRow',
  rowData: getRowData(),

  onCellValueChanged: onCellValueChanged,
  onRowValueChanged: onRowValueChanged,
}

function onCellValueChanged(event: CellValueChangedEvent) {
  console.log(
    'onCellValueChanged: ' + event.colDef.field + ' = ' + event.newValue
  )
}

function onRowValueChanged(event: RowValueChangedEvent) {
  var data = event.data
  console.log(
    'onRowValueChanged: (' +
    data.make +
    ', ' +
    data.model +
    ', ' +
    data.price +
    ', ' +
    data.field5 +
    ')'
  )
}

function getRowData() {
  var rowData = []
  for (var i = 0; i < 10; i++) {
    rowData.push({
      make: 'Toyota',
      model: 'Celica',
      price: 35000 + i * 1000,
      field4: 'Sample XX',
      field5: 'Sample 22',
      field6: 'Sample 23',
    })
    rowData.push({
      make: 'Ford',
      model: 'Mondeo',
      price: 32000 + i * 1000,
      field4: 'Sample YY',
      field5: 'Sample 24',
      field6: 'Sample 25',
    })
    rowData.push({
      make: 'Porsche',
      model: 'Boxter',
      price: 72000 + i * 1000,
      field4: 'Sample ZZ',
      field5: 'Sample 26',
      field6: 'Sample 27',
    })
  }
  return rowData
}

function getNumericCellEditor() {
  function isCharNumeric(charStr: string) {
    return !!/\d/.test(charStr)
  }

  function isKeyPressedNumeric(event: any) {
    var charStr = event.key;
    return isCharNumeric(charStr)
  }

  // function to act as a class
  function NumericCellEditor() { }

  // gets called once before the renderer is used
  NumericCellEditor.prototype.init = function (params: ICellEditorParams) {
    // we only want to highlight this cell if it started the edit, it is possible
    // another cell in this row started the edit
    this.focusAfterAttached = params.cellStartedEdit

    // create the cell
    this.eInput = document.createElement('input')
    this.eInput.style.width = '100%'
    this.eInput.style.height = '100%'
    this.eInput.value = (params.charPress && isCharNumeric(params.charPress))
      ? params.charPress
      : params.value

    var that = this
    this.eInput.addEventListener('keypress', function (event: any) {
      if (!isKeyPressedNumeric(event)) {
        that.eInput.focus()
        if (event.preventDefault) event.preventDefault()
      }
    })
  }

  // gets called once when grid ready to insert the element
  NumericCellEditor.prototype.getGui = function () {
    return this.eInput
  }

  // focus and select can be done after the gui is attached
  NumericCellEditor.prototype.afterGuiAttached = function () {
    // only focus after attached if this cell started the edit
    if (this.focusAfterAttached) {
      this.eInput.focus()
      this.eInput.select()
    }
  }

  // returns the new value after editing
  NumericCellEditor.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart
  }

  // example - will reject the number if it contains the value 007
  // - not very practical, but demonstrates the method.
  NumericCellEditor.prototype.isCancelAfterEnd = function () { }

  // returns the new value after editing
  NumericCellEditor.prototype.getValue = function () {
    return this.eInput.value
  }

  // when we tab onto this editor, we want to focus the contents
  NumericCellEditor.prototype.focusIn = function () {
    var eInput = this.getGui()
    eInput.focus()
    eInput.select()
    console.log('NumericCellEditor.focusIn()')
  }

  // when we tab out of the editor, this gets called
  NumericCellEditor.prototype.focusOut = function () {
    // but we don't care, we just want to print it for demo purposes
    console.log('NumericCellEditor.focusOut()')
  }

  return NumericCellEditor
}
// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
  var eGridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(eGridDiv, gridOptions)
})
