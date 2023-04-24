import { Grid, ColDef, ColGroupDef, GridOptions, IFiltersToolPanel } from '@ag-grid-community/core'

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    groupId: 'athleteGroupId',
    headerName: 'Athlete',
    children: [
      {
        headerName: 'Name',
        field: 'athlete',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      { field: 'age' },
      {
        groupId: 'competitionGroupId',
        headerName: 'Competition',
        children: [{ field: 'year' }, { field: 'date', minWidth: 180 }],
      },
      { field: 'country', minWidth: 200 },
    ],
  },
  { colId: 'sport', field: 'sport', minWidth: 200 },
  {
    headerName: 'Medals',
    children: [
      { field: 'gold' },
      { field: 'silver' },
      { field: 'bronze' },
      { field: 'total' },
    ],
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  sideBar: 'filters',
  onGridReady: (params) => {
    // initially collapse all filter groups
    params.api.getToolPanelInstance('filters')!.collapseFilterGroups()
  },
}

function collapseAll() {
  gridOptions.api!.getToolPanelInstance('filters')!.collapseFilterGroups()
}

function expandAthleteAndCompetition() {
  gridOptions
    .api!.getToolPanelInstance('filters')!
    .expandFilterGroups(['athleteGroupId', 'competitionGroupId'])
}

function collapseCompetition() {
  gridOptions
    .api!.getToolPanelInstance('filters')!
    .collapseFilterGroups(['competitionGroupId'])
}

function expandAll() {
  gridOptions.api!.getToolPanelInstance('filters')!.expandFilterGroups()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
