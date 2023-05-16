import { Grid, ColDef, GridOptions, INumberCellEditorParams, ValueFormatterParams } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { 
    headerName: 'Number Editor',
    field: 'number',
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: {
      precision: 0,
    } as INumberCellEditorParams,
  },
  { 
    headerName: 'Date Editor',
    field: 'date',
    valueFormatter: (params: ValueFormatterParams<any, Date>) => params.value
      ? `${params.value.getFullYear()}-${params.value.getMonth() + 1}-${params.value.getDate()}`
      : '',
    cellEditor: 'agDateCellEditor',
  },
  { 
    headerName: 'Date as String Editor',
    field: 'dateString',
    cellEditor: 'agDateStringCellEditor',
    cellEditorPopup: true,
  },
  { 
    headerName: 'Checkbox Cell Editor',
    field: 'boolean',
    cellEditor: 'agCheckboxCellEditor',
  }
];

const data = Array.from(Array(20).keys()).map( (val: any, index: number) => ({
  number: index,
  date: new Date(2023, 5, index + 1),
  dateString: `2023-06-${index < 9 ? '0' + (index + 1) : index}`,
  boolean: !!(index % 2),
}) );

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
    resizable: true,
    editable: true
  },
  columnDefs: columnDefs,
  rowData: data
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
