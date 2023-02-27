import { AgCartesianChartOptions, AgChart } from "ag-charts-community"

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

function nearest() {
  options.series = options.series?.map(s => ({
    ...s,
    nodeClickRange: "nearest",
  }))
  AgChart.update(chart, options)
}

function exact() {
  options.series = options.series?.map(s => ({
    ...s,
    nodeClickRange: "exact",
  }))
  AgChart.update(chart, options)
}

function distance() {
  options.series = options.series?.map(s => ({
    ...s,
    nodeClickRange: 10,
  }))
  AgChart.update(chart, options)
}
