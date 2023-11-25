import { ColDef, ColGroupDef } from '@ag-grid-community/core';

export const getColumnDefs = (): ColDef[] => [
  { field: 'make', flex: 1, suppressMovable: true, lockPosition: true },
  {
    field: 'model',
    flex: 1,
    filter: 'agSetColumnFilter',
    filterParams: {
      buttons: ['reset', 'apply'],
    },
  },
  { field: 'year', flex: 1 },
  { field: 'price', flex: 1 },
];

export const getGroupColumnDefs = (columns: ColDef[]): ColGroupDef[] => [
  {
    headerName: 'Car',
    children: columns.filter((c) => c.field === 'make' || c.field === 'model'),
  },
  {
    headerName: 'Data',
    children: columns.filter((c) => c.field !== 'make' && c.field !== 'model'),
  },
  columns.find((c) => c.field === 'model'),
];

export const getDeepGroupColumnDefs = (columns: ColDef[]): ColGroupDef[] => [
  {
    headerName: 'Car',
    children: [
      {
        headerName: 'Make',
        children: columns.filter((c) => c.field === 'make'),
      },
      ...columns.filter((c) => c.field === 'model'),
    ],
  },
  {
    headerName: 'Data',
    children: columns.filter((c) => c.field !== 'make' && c.field !== 'model'),
  },
];

export const getRowData = () => [
  { make: 'Toyota', model: 'Celica', year: 2001, price: 35000 },
  { make: 'Toyota', model: 'Celica', year: 2002, price: 36000 },
  { make: 'Toyota', model: 'Celica', year: 2003, price: 37000 },
  { make: 'Toyota', model: 'Celica', year: 2004, price: 38000 },
  { make: 'Toyota', model: 'Celica', year: 2005, price: 39000 },
  { make: 'Ford', model: 'Mondeo', year: 2001, price: 32000 },
  { make: 'Ford', model: 'Mondeo', year: 2002, price: 33000 },
  { make: 'Ford', model: 'Mondeo', year: 2003, price: 34000 },
  { make: 'Ford', model: 'Mondeo', year: 2004, price: 35000 },
  { make: 'Ford', model: 'Mondeo', year: 2005, price: 36000 },
  { make: 'Porsche', model: 'Boxster', year: 2001, price: 73000 },
  { make: 'Porsche', model: 'Boxster', year: 2002, price: 74000 },
  { make: 'Porsche', model: 'Boxster', year: 2003, price: 75000 },
  { make: 'Porsche', model: 'Boxster', year: 2004, price: 76000 },
  { make: 'Porsche', model: 'Boxster', year: 2005, price: 77000 },
];
