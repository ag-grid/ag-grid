import { Grid, GridOptions, ColumnGroup } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true },
    { field: 'athlete' },
    { field: 'sport', pivot: true, enablePivot: true },
    { field: 'year', pivot: true, enablePivot: true },
    { field: 'date', pivot: true, enablePivot: true },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    maxWidth: 140,
    filter: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 180,
  },
  pivotMode: true,
}

function expandAll(expand: boolean) {
  const state = gridOptions.columnApi!.getColumnGroupState();
  const expandedState = state.map((group) => ({
    groupId: group.groupId,
    open: expand,
  }));
  gridOptions.columnApi!.setColumnGroupState(expandedState);
}

function expandRoute(route: string[]) {
  const expand = (columnGroup: ColumnGroup) => {
    if (columnGroup) {
      expand(columnGroup.getParent());
      gridOptions.columnApi!.setColumnGroupOpened(columnGroup.getGroupId(), true);
    }
  }

  const targetCol = gridOptions.columnApi!.getPivotResultColumn(route, 'gold');
  if (targetCol) {
    expand(targetCol.getParent());
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
