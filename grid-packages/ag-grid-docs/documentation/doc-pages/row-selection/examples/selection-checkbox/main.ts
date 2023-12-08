import {
  GridApi,
  createGrid,
  CheckboxSelectionCallbackParams,
  GridOptions,
  ICellRendererParams,
  IGroupCellRendererParams,
} from '@ag-grid-community/core';

function checkboxSelection(params: CheckboxSelectionCallbackParams) {
  return params.node.group === true
}

function checkbox(params: ICellRendererParams) {
  return params.node.group === true
}

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
    {
      field: 'age',
      minWidth: 120,
      checkboxSelection: checkboxSelection,
    },
    { field: 'year', maxWidth: 120 },
    { field: 'date', minWidth: 150 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  autoGroupColumnDef: {
    headerName: 'Athlete',
    field: 'athlete',
    minWidth: 250,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      checkbox
    } as IGroupCellRendererParams,
  },
  rowSelection: 'multiple',
  groupSelectsChildren: true,
  suppressRowClickSelection: true,
  suppressAggFuncInHeader: true,
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
