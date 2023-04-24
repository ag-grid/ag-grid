import { AgCartesianChartOptions, AgChart } from "ag-charts-community"

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  tooltip: {
    range: "nearest",
  },
  data: [
    {
      month: "Jun",
      value1: 50,
      hats_made: 40,
    },
    {
      month: "Jul",
      value1: 70,
      hats_made: 50,
    },
    {
      month: "Aug",
      value1: 60,
      hats_made: 30,
    },
  ],
  series: [
    {
      type: "line",
      xKey: "month",
      yKey: "value1",
      yName: "Sweaters Made",
    },
    {
      type: "line",
      xKey: "month",
      yKey: "hats_made",
      yName: "Hats Made",
    },
  ],
}

var chart = AgChart.create(options)

function nearest() {
  if (options.tooltip) options.tooltip.range = "nearest"
  AgChart.update(chart, options)
}

function exact() {
  if (options.tooltip) options.tooltip.range = "exact"
  AgChart.update(chart, options)
}

function distance() {
  if (options.tooltip) options.tooltip.range = 10
  AgChart.update(chart, options)
}
