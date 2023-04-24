import {
  ChartCreated,
  ChartOptionsChanged,
  ColDef,
  FirstDataRenderedEvent,
  Grid,
  GridApi,
  GridOptions,
} from "@ag-grid-community/core"
import { AgChart } from "ag-charts-community"

const columnDefs: ColDef[] = [
  { field: "Month", width: 150, chartDataType: "category" },
  { field: "Sunshine (hours)", chartDataType: "series" },
  { field: "Rainfall (mm)", chartDataType: "series" },
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
  popupParent: document.body,
  columnDefs: columnDefs,
  enableRangeSelection: true,
  enableCharts: true,
  onChartCreated: onChartCreated,
  onChartOptionsChanged: onChartOptionsChanged,
  onFirstDataRendered: onFirstDataRendered,
}

function onChartCreated(event: ChartCreated) {
  update(gridOptions.api!, event)

  console.log("Created chart with ID " + event.chartId)
}

function onChartOptionsChanged(event: ChartOptionsChanged) {
  update(gridOptions.api!, event)

  console.log("Options change of chart with ID " + event.chartId)
}

function onFirstDataRendered(event: FirstDataRenderedEvent<any>) {
  gridOptions.api!.createRangeChart({
    chartType: "column",
    cellRange: { columns: ["Month", "Sunshine (hours)", "Rainfall (mm)"] },
  });
}

function update(api: GridApi, event: { chartId: string }) {
  const chartRef = api.getChartRef(event.chartId)!
  const chart = chartRef.chart

  AgChart.updateDelta(chart, {
    legend: {
      listeners: {
        legendItemClick: (e: any) => console.log("legendItemClick", e),
      },
    },
    listeners: {
      seriesNodeClick: (e: any) => console.log("seriesNodeClick", e),
    },
  })
}

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", function () {
  var gridDiv = document.querySelector<HTMLElement>("#myGrid")!
  new Grid(gridDiv, gridOptions)

  fetch("https://www.ag-grid.com/example-assets/weather-se-england.json")
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
