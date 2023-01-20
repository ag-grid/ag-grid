import { Grid, CellValueChangedEvent, GridOptions, ValueGetterParams, ValueParserParams, ValueSetterParams, ValueFormatterParams, ProcessCellForExportParams, ICellEditorParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'a',
      valueGetter: valueGetterA,
      valueParser: valueParserA,
      valueSetter: valueSetterA,
      equals: equalsA,
    },
    {
      field: 'b',
      valueFormatter: valueFormatterB,
      valueParser: valueParserB,
      cellEditorParams: cellEditorParamsB,
    },
  ],
  defaultColDef: {
    editable: true,
  },
  rowData: getRows(),
  enableRangeSelection: true,
  enableFillHandle: true,
  fillHandleDirection: 'y',
  processCellForClipboard: processCellForClipboard,
  processCellFromClipboard: processCellFromClipboard,
  undoRedoCellEditing: true,
  undoRedoCellEditingLimit: 5,
  enableCellChangeFlash: true,
  onFirstDataRendered: onFirstDataRendered,
  onCellValueChanged: onCellValueChanged,
}

function createValueA(value: string, data: any) {
  return {    
    actualValueA: value,
    anotherPropertyA: data.anotherPropertyA,
    // `toString` is the equivalent to having a `valueFormatter`. Convert complex object to string for rendering
    toString: function () {     
      return this.actualValueA;
    },
  };
}

function valueGetterA(params: ValueGetterParams) {
  // Create complex object from underlying data
  return createValueA(params.data[params.colDef.field!], params.data);
};

function valueParserA(params: ValueParserParams) {
  // Convert string `newValue` back into complex object (reverse of `toString` on complex object). `newValue` is string.
  // We have access to `data` (as well as `oldValue`) to retrieve any other properties we need to recreate the complex object.
  // For undo/redo to work, we need immutable data, so can't mutate `oldValue`
  return createValueA(params.newValue, params.data);
}

function valueSetterA(params: ValueSetterParams) {
  // Update data from complex object (reverse of `valueGetterA`)
  params.data[params.colDef.field!] = params.newValue.actualValueA;
  return true;
}

function equalsA(valueA: any, valueB: any) {
  // Used to detect whether cell value has changed for refreshing
  return valueA.actualValueA === valueB.actualValueA;
}

function createValueB(value: string, data: any) {
  return {
    actualValueB: value,
    anotherPropertyB: data.anotherPropertyB
  };
}

function valueFormatterB(params: ValueFormatterParams) {
  // Convert complex object to string
  return params.value.actualValueB;
}

function valueParserB(params: ValueParserParams) {
  // Convert string `newValue` back into complex object (reverse of `valueFormatterB`). `newValue` is string
  return createValueB(params.newValue, params.data);
}

function cellEditorParamsB(params: ICellEditorParams) {
  // Display formatted string value when editing cell
  return {
    ...params,
    value: params.formatValue(params.value),
  }
}

function processCellForClipboard(params: ProcessCellForExportParams) {
  // Cell copying requires string values, so we need to convert from complex objects
  const colId = params.column.getId();
  if (colId === 'a') {
    return params.value.actualValueA;
  } else if (colId === 'b') {
    return params.value.actualValueB;
  }
  return params.value;
}

function processCellFromClipboard(params: ProcessCellForExportParams) {
  // Cell pasting uses string values, so we need to convert to complex values
  const colId = params.column.getId();
  if (colId === 'a') {
    return createValueA(params.value, params.node!.data);
  } else if (colId === 'b') {
    return createValueB(params.value, params.node!.data);
  }
  return params.value;
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
  var undoSize = params.api.getCurrentUndoSize()
  setValue('#undoInput', undoSize)
  disable('#undoBtn', undoSize < 1)

  var redoSize = params.api.getCurrentRedoSize()
  setValue('#redoInput', redoSize)
  disable('#redoBtn', redoSize < 1)
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
      b: {    
        actualValueB: 'b-' + i,
        anotherPropertyB: 'b',
      },
      anotherPropertyA: 'a'
    }
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
