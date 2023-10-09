import { GridApi, createGrid, ColGroupDef, GridOptions } from '@ag-grid-community/core';
declare var window: any;
const columnDefs: ColGroupDef[] = [
  {
    headerName: 'Athlete',
    children: [
      { field: 'athlete' },
      { field: 'country', columnGroupShow: 'open' },
      { field: 'sport', columnGroupShow: 'open' },
      { field: 'year', columnGroupShow: 'open' },
      { field: 'date', columnGroupShow: 'open' },
    ],
  },
  {
    headerName: 'Medals',
    children: [
      { field: 'total', columnGroupShow: 'closed' },
      { field: 'gold', columnGroupShow: 'open' },
      { field: 'silver', columnGroupShow: 'open' },
      { field: 'bronze', columnGroupShow: 'open' },
    ],
  },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    width: 150,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
}

function saveState() {
  window.groupState = api!.getColumnGroupState()
  console.log('group state saved', window.groupState)
  console.log('column state saved')
}

function restoreState() {
  if (!window.groupState) {
    console.log('no columns state to restore by, you must save state first')
    return
  }
  api!.setColumnGroupState(window.groupState)
  console.log('column state restored')
}

function resetState() {
  api!.resetColumnGroupState()
  console.log('column state reset')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
