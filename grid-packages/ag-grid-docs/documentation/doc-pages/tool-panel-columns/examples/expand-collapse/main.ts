import {
  ColGroupDef,
  Grid,
  GridOptions,
  IColumnToolPanel,
} from '@ag-grid-community/core'

const columnDefs: ColGroupDef[] = [
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
      {
        groupId: 'competitionGroupId',
        headerName: 'Competition',
        children: [{ field: 'year' }, { field: 'date', minWidth: 180 }],
      },
    ],
  },
  {
    groupId: 'medalsGroupId',
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
    // allow every column to be aggregated
    enableValue: true,
    // allow every column to be grouped
    enableRowGroup: true,
    // allow every column to be pivoted
    enablePivot: true,
    filter: true,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  sideBar: 'columns',
  onGridReady: (params) => {
    var columnToolPanel = (gridOptions.api!.getToolPanelInstance(
      'columns'
    ) as unknown) as IColumnToolPanel
    columnToolPanel.collapseColumnGroups()
  },
}

function expandAllGroups() {
  var columnToolPanel = (gridOptions.api!.getToolPanelInstance(
    'columns'
  ) as unknown) as IColumnToolPanel
  columnToolPanel.expandColumnGroups()
}

function collapseAllGroups() {
  var columnToolPanel = (gridOptions.api!.getToolPanelInstance(
    'columns'
  ) as unknown) as IColumnToolPanel
  columnToolPanel.collapseColumnGroups()
}

function expandAthleteAndCompetitionGroups() {
  var columnToolPanel = (gridOptions.api!.getToolPanelInstance(
    'columns'
  ) as unknown) as IColumnToolPanel
  columnToolPanel.expandColumnGroups(['athleteGroupId', 'competitionGroupId'])
}

function collapseCompetitionGroups() {
  var columnToolPanel = (gridOptions.api!.getToolPanelInstance(
    'columns'
  ) as unknown) as IColumnToolPanel
  columnToolPanel.collapseColumnGroups(['competitionGroupId'])
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
