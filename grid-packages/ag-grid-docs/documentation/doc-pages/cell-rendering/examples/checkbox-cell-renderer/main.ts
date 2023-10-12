import { GridApi, createGrid, GridOptions, SuppressKeyboardEventParams } from '@ag-grid-community/core';

const data = Array.from(Array(10).keys()).map( (_val: any, index: number) => ({
  value1: !!(index % 2),
  value2: !!(index % 2),
  value3: !!(index % 2),
}) );

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'value1',
      headerName: 'Disabled Checkbox',
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        disabled: true,
      },
    },
    {
      field: 'value2',
      headerName: 'With Checkbox Editor',
      cellRenderer: 'agCheckboxCellRenderer',
      cellEditor: 'agCheckboxCellEditor',
      editable: true,
      suppressKeyboardEvent: (params: SuppressKeyboardEventParams<any, boolean>) => params.event.key === ' ',
    },
    {
      field: 'value3',
      headerName: 'Without Editor',
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        disabled: false,
      },
      suppressKeyboardEvent: (params: SuppressKeyboardEventParams<any, boolean>) => params.event.key === ' ',
    },
  ],
  rowData: data,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
