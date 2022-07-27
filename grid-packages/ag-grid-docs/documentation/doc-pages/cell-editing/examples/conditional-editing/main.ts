import { Grid, GridOptions, EditableCallbackParams, CellClassParams } from '@ag-grid-community/core'

let editableYear = 2012;

function isCellEditable(params: EditableCallbackParams | CellClassParams) {
  const editableCols = ['athlete', 'age', 'country'];
  return params.data.year === editableYear && editableCols.includes(params.colDef.field!);
}

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    editable: (params: EditableCallbackParams<IOlympicData>) => {
      return isCellEditable(params);
    },
    cellStyle: (params) => {
      if (isCellEditable(params)) {
        return { backgroundColor: 'lightBlue' };
      }
    }
  }
}

function setEditableYear(year: number) {
  editableYear = year;
  // Redraw to re-apply the new cell style
  gridOptions.api!.redrawRows();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
