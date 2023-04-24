import { Grid, ColDef, GridOptions, ISetFilter, IFiltersToolPanel } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [{ field: 'athlete', filter: 'agSetColumnFilter' }]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
  },
  sideBar: 'filters',
  onGridReady: (params) => {
    params.api.getToolPanelInstance('filters')!.expandFilters()
  },
}

let savedMiniFilterText: string | null = '';

function getMiniFilterText() {
  const athleteFilter = gridOptions.api!.getFilterInstance<ISetFilter>('athlete')!;
  console.log(athleteFilter.getMiniFilter());
}

function saveMiniFilterText() {
  const athleteFilter = gridOptions.api!.getFilterInstance<ISetFilter>('athlete')!;
  savedMiniFilterText = athleteFilter.getMiniFilter();
}

function restoreMiniFilterText() {
  const athleteFilter = gridOptions.api!.getFilterInstance<ISetFilter>('athlete')!;
  athleteFilter.setMiniFilter(savedMiniFilterText)
}

function resetFilter() {
  const athleteFilter = gridOptions.api!.getFilterInstance<ISetFilter>('athlete')!;
  athleteFilter.setModel(null)
  gridOptions.api!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
