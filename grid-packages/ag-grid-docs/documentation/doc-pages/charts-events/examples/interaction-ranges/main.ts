import {
  AgCartesianChartOptions,
  AgChart,
  AgChartInteractionRange,
} from "ag-charts-community"

let options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  tooltip: {
    range: "nearest",
  },
  data: [
    {
      quarter: "Q1",
      petrol: 200,
      diesel: 100,
    },
    {
      quarter: "Q2",
      petrol: 300,
      diesel: 130,
    },
    {
      quarter: "Q3",
      petrol: 350,
      diesel: 160,
    },
    {
      quarter: "Q4",
      petrol: 400,
      diesel: 200,
    },
  ],
  series: [
    {
      xKey: "quarter",
      yKey: "petrol",
      nodeClickRange: "nearest",
      listeners: {
        nodeClick: event =>
          window.alert(`${event.yKey} - ${event.datum.petrol}`),
      },
    },
    {
      xKey: "quarter",
      yKey: "diesel",
      nodeClickRange: "nearest",
      listeners: {
        nodeClick: event =>
          window.alert(`${event.yKey} - ${event.datum.diesel}`),
      },
    },
  ],
  axes: [
    { type: "category", position: "bottom" },
    { type: "number", position: "left" },
  ],
}

var chart = AgChart.create(options)

function updateRange(range: AgChartInteractionRange) {
  if (options.tooltip) options.tooltip.range = range
  options.series = options.series?.map(s => ({
    ...s,
    nodeClickRange: range,
  }))
  AgChart.update(chart, options)
}

function nearest() {
  updateRange("nearest")
}

function exact() {
  updateRange("exact")
}

function distance() {
  updateRange(10)
}
