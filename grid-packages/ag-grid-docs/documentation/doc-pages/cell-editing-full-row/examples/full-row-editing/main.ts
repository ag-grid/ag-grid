import { Grid, CellValueChangedEvent, GridOptions, ICellEditorComp, ICellEditorParams, RowValueChangedEvent } from '@ag-grid-community/core'
declare var NumericCellEditor: ICellEditorComp;

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
    { field: 'price', cellEditor: NumericCellEditor },
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
  new Grid(eGridDiv, gridOptions)
})
