import { GridApi, createGrid, ColDef, GridOptions, GridReadyEvent } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 200 },
  { field: 'country', minWidth: 200 },
  { headerName: 'Group', valueGetter: 'data.country.charAt(0)' },
  { field: 'sport', minWidth: 150 },
  { field: 'gold', hide: true },
  { field: 'silver', hide: true },
  { field: 'bronze', hide: true },
  { field: 'total', hide: true },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    filter: true,
    minWidth: 100,
    flex: 1,
  },
  columnDefs: columnDefs,
  onGridReady: (params: GridReadyEvent) => {
    (document.getElementById('allRows') as HTMLInputElement).checked = true
  },
}

function onBtExport() {
  gridApi!.exportDataAsExcel({
    exportedRows: (document.getElementById('allRows') as HTMLInputElement).checked ? 'all' : 'filteredAndSorted',
  })
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);
fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  .then(response => response.json())
  .then(data =>
    gridApi.setGridOption('rowData', data.filter((rec: any) => rec.country != null))
  )
