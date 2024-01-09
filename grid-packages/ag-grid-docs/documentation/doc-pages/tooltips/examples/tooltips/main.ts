import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    tooltipField: 'athlete',
    headerTooltip: 'Athlete column',
  },
  {
    field: 'age',
    tooltipField: 'age',
    headerTooltip: 'Age column',
  },
  {
    field: 'country',
    tooltipField: 'country',
    headerTooltip: 'Country column',
  },
  {
    field: 'year',
    tooltipValueGetter: (params: ITooltipParams) => 'A fixed tooltip value',
    headerTooltip: 'Year column',
  },
  {
    field: 'sport',
    tooltipValueGetter: (params: ITooltipParams) => params.value,
    headerTooltip: 'Sport column',
  },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
  },
  rowData: null,
  columnDefs: columnDefs,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridApi!.setGridOption('rowData', data)
    })
})
