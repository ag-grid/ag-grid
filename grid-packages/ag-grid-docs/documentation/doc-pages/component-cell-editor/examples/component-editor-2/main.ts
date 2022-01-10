import {
  ColDef,
  GridOptions,
  ICellRendererParams,
  KeyCreatorParams,
} from '@ag-grid-community/core'

declare var GenderRenderer: any
declare var NumericEditor: any
declare var MoodRenderer: any
declare var MoodEditor: any

const countryCellRenderer = (params: ICellRendererParams) => params.value.name

const columnDefs: ColDef[] = [
  { field: 'first_name', headerName: 'First Name', width: 120, editable: true },
  { field: 'last_name', headerName: 'Last Name', width: 120, editable: true },
  {
    field: 'gender',
    width: 100,
    editable: true,
    cellRendererComp: GenderRenderer,
    cellEditorComp: 'agRichSelectCellEditor',
    cellEditorParams: {
      cellRendererComp: GenderRenderer,
      values: ['Male', 'Female'],
    },
  },
  {
    field: 'age',
    width: 80,
    editable: true,
    cellEditorComp: NumericEditor,
  },
  {
    field: 'mood',
    width: 100,
    cellRendererComp: MoodRenderer,
    cellEditorComp: MoodEditor,
    editable: true,
  },
  {
    field: 'country',
    width: 110,
    cellEditorComp: 'agRichSelectCellEditor',
    cellRendererComp: countryCellRenderer,
    keyCreator: function (params: KeyCreatorParams) {
      return params.value.name
    },
    cellEditorParams: {
      cellRendererComp: countryCellRenderer,
      values: [
        { name: 'Ireland', code: 'IE' },
        { name: 'UK', code: 'UK' },
        { name: 'France', code: 'FR' },
      ],
    },
    editable: true,
  },
  {
    field: 'address',
    editable: true,
    cellEditorComp: 'agLargeTextCellEditor',
    cellEditorParams: {
      maxLength: '300', // override the editor defaults
      cols: '50',
      rows: '6',
    },
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: getData(),
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  onRowEditingStarted: event => {
    console.log('never called - not doing row editing')
  },
  onRowEditingStopped: event => {
    console.log('never called - not doing row editing')
  },
  onCellEditingStarted: event => {
    console.log('cellEditingStarted')
  },
  onCellEditingStopped: event => {
    console.log('cellEditingStopped')
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)
})
