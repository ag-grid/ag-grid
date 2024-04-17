import {
  createGrid,
  CellRange,
  GridOptions,
  RangeSelectionChangedEvent,
  ProcessCellForExportParams,
  RangeDeleteStartEvent,
  RangeDeleteEndEvent, 
  GridApi
} from '@ag-grid-community/core'

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, ClipboardModule, MenuModule, RangeSelectionModule]);

let gridApi: GridApi;
const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
  },
  enableRangeSelection: true,
  onRangeSelectionChanged: onRangeSelectionChanged,

  processCellForClipboard: (params: ProcessCellForExportParams) => {
    if (
      params.column.getColId() === 'athlete' &&
      params.value &&
      params.value.toUpperCase
    ) {
      return params.value.toUpperCase()
    }

    return params.value
  },

  processCellFromClipboard: (params: ProcessCellForExportParams) => {
    if (
      params.column.getColId() === 'athlete' &&
      params.value &&
      params.value.toLowerCase
    ) {
      return params.value.toLowerCase()
    }
    return params.value
  },
  onRangeDeleteStart: (event: RangeDeleteStartEvent) => {
    console.log('onRangeDeleteStart', event);
  },
  onRangeDeleteEnd: (event: RangeDeleteEndEvent) => {
    console.log('onRangeDeleteEnd', event);
  }
}

function onAddRange() {
  gridApi!.addCellRange({
    rowStartIndex: 4,
    rowEndIndex: 8,
    columnStart: 'age',
    columnEnd: 'date',
  })
}

function onClearRange() {
  gridApi!.clearRangeSelection()
}

function onRangeSelectionChanged(event: RangeSelectionChangedEvent) {
  var lbRangeCount = document.querySelector('#lbRangeCount')!
  var lbEagerSum = document.querySelector('#lbEagerSum')!
  var lbLazySum = document.querySelector('#lbLazySum')!
  var cellRanges = gridApi!.getCellRanges()

  // if no selection, clear all the results and do nothing more
  if (!cellRanges || cellRanges.length === 0) {
    lbRangeCount.textContent = '0'
    lbEagerSum.textContent = '-'
    lbLazySum.textContent = '-'
    return
  }

  // set range count to the number of ranges selected
  lbRangeCount.textContent = cellRanges.length + ''

  var sum = 0;

  if (cellRanges) {
    cellRanges.forEach((range: CellRange) => {
      // get starting and ending row, remember rowEnd could be before rowStart
      var startRow = Math.min(range.startRow!.rowIndex, range.endRow!.rowIndex)
      var endRow = Math.max(range.startRow!.rowIndex, range.endRow!.rowIndex)

      for (var rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        range.columns.forEach((column) => {
          var rowNode = gridApi.getDisplayedRowAtIndex(rowIndex)!;
          var value = gridApi.getCellValue(column, rowNode)
          if (typeof value === 'number') {
            sum += value
          }
        })
      }
    })
  }


  lbEagerSum.textContent = sum + ''

  if (event.started) {
    lbLazySum.textContent = '?'
  }
  if (event.finished) {
    lbLazySum.textContent = sum + ''
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
})