import { ColDef, GetRowIdParams, Grid, GridOptions, RowSelectedEvent, ValueFormatterParams } from '@ag-grid-community/core';

interface ICar {
  make: string;
  model: string;
  price: number;
}

const columnDefs: ColDef<ICar>[] = [
  { headerName: 'Make', field: 'make' },
  { headerName: 'Model', field: 'model' },
  {
    headerName: 'Price', field: 'price',
    valueFormatter: (params: ValueFormatterParams<ICar, number>) => {
      // params.value: number
      return '£' + params.value;
    }
  },
]

// Data with ICar interface
var rowData: ICar[] = [
  { make: 'Toyota', model: 'Celica', price: 35000 },
  { make: 'Ford', model: 'Mondeo', price: 32000 },
  { make: 'Porsche', model: 'Boxster', price: 72000 },
]

// Pass ICar as generic row data type
const gridOptions: GridOptions<ICar> = {
  columnDefs: columnDefs,
  rowData: rowData,
  rowSelection: 'multiple',
  // Type specified her but can be omitted and inferred by Typescript
  getRowId: (params: GetRowIdParams<ICar>) => {
    // params.data : ICar
    return params.data.make + params.data.model;
  },
  onRowSelected: (event: RowSelectedEvent<ICar>) => {
    // event.data: ICar | undefined
    if (event.data) {
      const price = event.data.price;
      console.log('Price with 10% discount:', price * 0.9)
    }
  }
}

function onShowSelection() {
  // api.getSelectedRows() : ICar[]
  const cars: ICar[] = gridOptions.api!.getSelectedRows();
  console.log('Selected cars are', cars.map(c => `${c.make} ${c.model}`))
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
  // lookup the container we want the Grid to use
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!

  // create the grid passing in the div to use together with the columns & data we want to use
  new Grid(eGridDiv, gridOptions)
})
