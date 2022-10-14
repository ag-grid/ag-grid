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
    { field: "athlete", minWidth: 200 },
    { field: "country", minWidth: 200, rowGroup: true, hide: true },
    { field: "sport", minWidth: 150 },
    { field: "gold" }
  ],

  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 150,
    flex: 1,
  },

  popupParent: document.body,
}

const getParams: () => ExcelExportParams = () => ({
  processCellCallback(params: ProcessCellForExportParams): string {
    const value = params.value
    return value === undefined ? '' : `_${value}_`
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
