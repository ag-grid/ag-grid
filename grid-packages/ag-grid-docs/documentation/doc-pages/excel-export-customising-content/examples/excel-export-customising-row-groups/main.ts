import {
  ExcelExportParams,
  Grid,
  GridOptions,
  ProcessCellForExportParams,
  ProcessRowGroupForExportParams,
} from "@ag-grid-community/core"

const getParams: () => ExcelExportParams = () => ({
  processCellCallback(params: ProcessCellForExportParams): string {
    const value = params.value
    return value === undefined ? '' : `_${value}_`
  },
  processRowGroupCallback(params: ProcessRowGroupForExportParams): string {
    const { node } = params;

    if (!node.footer) { return `row group: ${node.key}`; }
    const isRootLevel = node.level === -1;

    if (isRootLevel) { return 'Grand Total'; }
    return `Sub Total (${ node.key })`;
  },
});

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: "athlete", minWidth: 200 },
    { field: "country", minWidth: 200, rowGroup: true, hide: true },
    { field: "sport", minWidth: 150 },
    { field: "gold", aggFunc: 'sum' }
  ],

  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 150,
    flex: 1,
  },

  groupIncludeFooter: true,
  groupIncludeTotalFooter: true,

  popupParent: document.body,
  defaultExcelExportParams: getParams()
}

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
