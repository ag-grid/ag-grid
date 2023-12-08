import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';
import { NumberFloatingFilterComponent } from "./numberFloatingFilterComponent_typescript";

const columnDefs: ColDef[] = [
  { field: 'athlete', filter: false },
  {
    field: 'gold',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'gold',
    },
  },
  {
    field: 'silver',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'silver',
    },
  },
  {
    field: 'bronze',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: '#CD7F32',
    },
  },
  {
    field: 'total',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'unset',
    },
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
  },
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(data => {
    gridApi.setGridOption('rowData', data)
  })
