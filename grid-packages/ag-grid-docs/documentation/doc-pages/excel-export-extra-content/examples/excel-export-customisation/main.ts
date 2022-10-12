import {
  ExcelExportParams,
  Grid,
  GridOptions,
  ProcessCellForExportParams,
  ProcessGroupHeaderForExportParams,
  ProcessHeaderForExportParams,
  ProcessRowGroupForExportParams,
} from "@ag-grid-community/core"

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      headerName: 'Athlete details',
      children: [
        { field: "athlete", minWidth: 200 },
        { field: "country", minWidth: 200, rowGroup: true, hide: true },
        { field: "sport", minWidth: 150 },
      ]
    },
    {
      headerName: 'Medal results',
      children: [
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" },
      ]
    }
  ],

  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },

  popupParent: document.body,
}

const getParams: () => ExcelExportParams = () => ({
  processCellCallback(params: ProcessCellForExportParams): string {
    const value = params.value
    return value === undefined ? '' : `_${value}_`
  },
  processHeaderCallback({ columnApi, column }: ProcessHeaderForExportParams): string {
    return `header: ${columnApi.getDisplayNameForColumn(column, null)}`
  },
  processGroupHeaderCallback({ columnApi, columnGroup }: ProcessGroupHeaderForExportParams): string {
    return `group header: ${columnApi.getDisplayNameForColumnGroup(columnGroup, null)}`
  },
  processRowGroupCallback(params: ProcessRowGroupForExportParams): string {
    return `row group: ${params.node.key}`
  },
})

function onBtExport() {
  gridOptions.api!.exportDataAsExcel(getParams())
}

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", () => {
  const gridDiv = document.querySelector<HTMLElement>("#myGrid")!
  new Grid(gridDiv, gridOptions)

  fetch("https://www.ag-grid.com/example-assets/small-olympic-winners.json")
    .then(response => response.json())
    .then(data =>
      gridOptions.api!.setRowData(
        data.filter((rec: any) => rec.country != null)
      )
    )
})
