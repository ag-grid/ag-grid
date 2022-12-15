import { Grid, GridOptions, IRowNode } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'athlete', minWidth: 180 },
    { field: 'age' },
    { field: 'year' },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  groupDefaultExpanded: 1,
}

function onBtForEachNode() {
  console.log('### api.forEachNode() ###')
  gridOptions.api!.forEachNode(printNode)
}

function onBtForEachNodeAfterFilter() {
  console.log('### api.forEachNodeAfterFilter() ###')
  gridOptions.api!.forEachNodeAfterFilter(printNode)
}

function onBtForEachNodeAfterFilterAndSort() {
  console.log('### api.forEachNodeAfterFilterAndSort() ###')
  gridOptions.api!.forEachNodeAfterFilterAndSort(printNode)
}

function onBtForEachLeafNode() {
  console.log('### api.forEachLeafNode() ###')
  gridOptions.api!.forEachLeafNode(printNode)
}

const printNode = (node: IRowNode<IOlympicData>, index?: number) => {
  if (node.group) {
    console.log(index + ' -> group: ' + node.key)
  } else {
    console.log(
      index + ' -> data: ' + node.data!.country + ', ' + node.data!.athlete
    )
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data.slice(0, 50)))
})
