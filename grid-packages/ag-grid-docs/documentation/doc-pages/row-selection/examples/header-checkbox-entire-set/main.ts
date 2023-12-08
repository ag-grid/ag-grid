import {
  GridApi,
  createGrid,
  CheckboxSelectionCallbackParams,
  GridOptions,
  HeaderCheckboxSelectionCallbackParams,
} from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', minWidth: 180 },
    { field: 'age' },
    { field: 'country', minWidth: 150 },
    { field: 'year' },
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
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn,
  },
  suppressRowClickSelection: true,
  rowSelection: 'multiple',
}

function isFirstColumn(params: CheckboxSelectionCallbackParams | HeaderCheckboxSelectionCallbackParams) {
  var displayedColumns = params.api.getAllDisplayedColumns()
  var thisIsFirstColumn = displayedColumns[0] === params.column
  return thisIsFirstColumn
}

function onQuickFilterChanged() {
  gridApi!.setGridOption('quickFilterText', (document.getElementById('quickFilter') as HTMLInputElement).value)
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
