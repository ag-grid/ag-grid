import { ColDef, FirstDataRenderedEvent, GridOptions, ITooltipParams } from '@ag-grid-community/core'
declare var CustomTooltip: any;
const toolTipValueGetter = (params: ITooltipParams) => ({ value: params.value })

const columnDefs: ColDef[] = [
  {
    headerName: 'Athlete Col 1',
    field: 'athlete',
    width: 150,
    tooltipField: 'athlete',
  },
  {
    headerName: 'Athlete Col 2',
    field: 'athlete',
    width: 150,
    tooltipComponent: 'customTooltip',
    tooltipValueGetter: toolTipValueGetter,
  },
  { field: 'sport', width: 110 },
  { field: 'gold', width: 100 },
  { field: 'silver', width: 100 },
  { field: 'bronze', width: 100 },
  { field: 'total', width: 100 },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },

  // set rowData to null or undefined to show loading panel by default
  rowData: null,
  columnDefs: columnDefs,

  components: {
    customTooltip: CustomTooltip,
  },

  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getDisplayedRowAtIndex(0)!.data.athlete = undefined
  params.api.getDisplayedRowAtIndex(1)!.data.athlete = null
  params.api.getDisplayedRowAtIndex(2)!.data.athlete = ''

  params.api.refreshCells()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
