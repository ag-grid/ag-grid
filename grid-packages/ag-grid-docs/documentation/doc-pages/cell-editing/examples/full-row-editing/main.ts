import { CellValueChangedEvent, GridOptions, ICellEditorComp, ICellEditorParams, RowValueChangedEvent } from '@ag-grid-community/core'

function isCharNumeric(charStr: string) {
  return !!/\d/.test(charStr)
}

function isKeyPressedNumeric(event: any) {
  var charStr = event.key;
  return isCharNumeric(charStr)
}

class NumericCellEditor implements ICellEditorComp {
  focusAfterAttached!: boolean
  eInput!: HTMLInputElement
  cancelBeforeStart: any
  // gets called once before the renderer is used
  init(params: ICellEditorParams) {
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
  getGui() {
    return this.eInput
  }

  // focus and select can be done after the gui is attached
  afterGuiAttached() {
    // only focus after attached if this cell started the edit
    if (this.focusAfterAttached) {
      this.eInput.focus()
      this.eInput.select()
    }
  }

  // returns the new value after editing
  isCancelBeforeStart() {
    return this.cancelBeforeStart
  }

  // example - will reject the number if it contains the value 007
  // - not very practical, but demonstrates the method.
  isCancelAfterEnd() {
    return false;
  }

  // returns the new value after editing
  getValue() {
    return this.eInput.value
  }

  // when we tab onto this editor, we want to focus the contents
  focusIn() {
    var eInput = this.getGui()
    eInput.focus()
    eInput.select()
    console.log('NumericCellEditor.focusIn()')
  }

  // when we tab out of the editor, this gets called
  focusOut() {
    // but we don't care, we just want to print it for demo purposes
    console.log('NumericCellEditor.focusOut()')
  }
}

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'make',
      cellEditorComp: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC'],
      },
    },
    { field: 'model' },
    { field: 'field4', headerName: 'Read Only', editable: false },
    { field: 'price', cellEditorComp: NumericCellEditor },
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

function onBtStopEditing() {
  gridOptions.api!.stopEditing()
}

function onBtStartEditing() {
  gridOptions.api!.setFocusedCell(2, 'make')
  gridOptions.api!.startEditingCell({
    rowIndex: 2,
    colKey: 'make',
  })
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(eGridDiv, gridOptions)
})
