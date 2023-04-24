import {
  AgCartesianSeriesTooltipRendererParams,
  AgChartOptions,
  AgChart
} from "ag-charts-community"

function renderer(params: AgCartesianSeriesTooltipRendererParams) {
  return (
    '<div class="ag-chart-tooltip-title" style="background-color:' +
    params.color +
    '">' +
    params.xValue +
    "</div>" +
    '<div class="ag-chart-tooltip-content">' +
    params.yValue.toFixed(0) +
    "</div>"
  )
}

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  data: [
    {
      month: "Dec",
      sweaters: 50,
      hats: 40,
    },
    {
      month: "Jan",
      sweaters: 70,
      hats: 50,
    },
    {
      month: "Feb",
      sweaters: 60,
      hats: 30,
    },
  ],
  series: [
    {
      type: "column",
      xKey: "month",
      tooltip: { renderer: renderer },
      yKey: "sweaters",
      yName: "Sweaters made",
      stacked: true,
    },
    {
      type: "column",
      xKey: "month",
      tooltip: { renderer: renderer },
      yKey: "hats",
      yName: "Hats made",
      stacked: true,
    },
  ],
}

var chart = AgChart.create(options)
