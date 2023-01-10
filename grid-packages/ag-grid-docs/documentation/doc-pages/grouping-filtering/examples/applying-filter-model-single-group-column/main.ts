import { Grid, GridOptions, ValueGetterParams } from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'age', rowGroup: true, hide: true },
    { field: 'country', rowGroup: true, hide: true },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    floatingFilter: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    filter: 'agNumberColumnFilter',
    filterValueGetter: (params: ValueGetterParams) => {
      const colId = params.column.getColId();
      console.log('auto-group column name:',colId);
      return params.data.age;
    },
  },
  animateRows: true,
  rowData: getData(),
}

function applyFilter() {
  gridOptions.api!.setFilterModel({
    'ag-Grid-AutoColumn': {
      filterType: 'number',
        type: 'lessThan',
        filter: 20
    },
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
