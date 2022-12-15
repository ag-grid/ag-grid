import { Grid, ColDef, GridOptions, ITextCellEditorParams, ILargeTextEditorParams, ISelectCellEditorParams, IRichCellEditorParams } from '@ag-grid-community/core'
import { ColourCellRenderer } from './colourCellRenderer_typescript'

const colors = ['Red','Green','Blue'];

const columnDefs: ColDef[] = [
  { 
    headerName: 'Text Editor', 
    field: 'color1', 
    cellRenderer: ColourCellRenderer,
    cellEditor: 'agTextCellEditor',
    cellEditorParams: {
      maxLength: 20
    } as ITextCellEditorParams
  },
  { 
    headerName: 'Select Editor', 
    field: 'color2', 
    cellRenderer: ColourCellRenderer,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: colors
    } as ISelectCellEditorParams
  },
  { 
    headerName: 'Rich Select Editor', 
    field: 'color3', 
    cellRenderer: ColourCellRenderer,
    cellEditor: 'agRichSelectCellEditor',
    cellEditorPopup: true,
    cellEditorParams: {
      values: colors, 
      cellRenderer: ColourCellRenderer
    } as IRichCellEditorParams
  },
  { 
    headerName: 'Large Text Editor', 
    field: 'description', 
    cellEditorPopup: true,
    cellEditor: 'agLargeTextCellEditor', 
    cellEditorParams: {
      maxLength: 250,
      rows: 10,
      cols: 50
    } as ILargeTextEditorParams,
    flex: 2 
  }
];

const data = Array.from(Array(20).keys()).map( (val: any, index: number) => ({
  color1: colors[index%3],
  color2: colors[index%3],
  color3: colors[index%3],
  description:  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
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
