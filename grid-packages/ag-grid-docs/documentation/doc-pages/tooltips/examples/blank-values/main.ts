import {
  ColDef,
  GridApi,
  createGrid,
  GridOptions,
  ITooltipParams
} from '@ag-grid-community/core';

const toolTipValueGetter = (params: ITooltipParams) => params.value == null || params.value === '' ? '- Missing -' : params.value;

const columnDefs: ColDef[] = [
  {
    headerName: 'Athlete Col 1',
    field: 'athlete',
    minWidth: 150,
    tooltipField: 'athlete',
  },
  {
    headerName: 'Athlete Col 2',
    field: 'athlete',
    minWidth: 150,
    tooltipValueGetter: toolTipValueGetter,
  },
  { field: 'sport', width: 110 },
  { field: 'gold', width: 100 },
  { field: 'silver', width: 100 },
  { field: 'bronze', width: 100 },
  { field: 'total', width: 100 },
]

let gridApi: GridApi;

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
  },
  rowData: null,
  columnDefs: columnDefs,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      // set some blank values to test tooltip against
      data[0].athlete = undefined;
      data[1].athlete = null;
      data[2].athlete = '';
      gridApi!.setGridOption('rowData', data)
    })
})
