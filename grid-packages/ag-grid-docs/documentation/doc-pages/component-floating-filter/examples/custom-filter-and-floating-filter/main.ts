import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';
import { NumberFloatingFilterComponent } from "./numberFloatingFilterComponent_typescript";
import { NumberFilterComponent } from "./numberFilterComponent_typescript";

const columnDefs: ColDef[] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    {
        field: 'gold',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filter: NumberFilterComponent
    },
    {
        field: 'silver',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filter: NumberFilterComponent
    },
    {
        field: 'bronze',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filter: NumberFilterComponent
    },
    {
        field: 'total',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            suppressFilterButton: true,
        },
        filter: NumberFilterComponent
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
