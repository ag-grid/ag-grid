import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

// specify the columns
const columnDefs: ColDef[] = [
    { headerName: 'Make', field: 'make', flex: 1 }
]

// let the grid know which columns and what data to use
const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: [],
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!

  // create the grid passing in the div to use together with the columns & data we want to use
  const gridApi: GridApi = createGrid(eGridDiv, gridOptions);
