import * as agCharts from "ag-charts-community"
import { AgAreaSeriesOptions, AgChartOptions } from "ag-charts-community"
import { getData } from "./data"

function buildSeries(name: string): AgAreaSeriesOptions {
  return {
    type: "area",
    xKey: "year",
    yKey: name.toLowerCase(),
    yName: name,
  }
}

const series = [
  buildSeries("IE"),
  buildSeries("Chrome"),
  buildSeries("Firefox"),
]

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  theme: {
    palette: {
      fills: ["#141259", "#7E88BF", "#F2DCE0", "#8C7326"],
      strokes: ["#141259", "#7E88BF", "#F2DCE0", "#8C7326"],
    },
    overrides: {
      area: {
        series: {
          fillOpacity: 0.9,
          marker: {
            enabled: true,
          },
        },
        legend: {
          position: "bottom",
        },
      },
    },
  },
  title: {
    text: "Browser Usage Statistics",
  },
  subtitle: {
    text: "2009-2019",
  },
  data: getData(),
  series,
  axes: [
    {
      position: "left",
      type: "number",
    },
    {
      position: "bottom",
      type: "time",
    },
  ],
}

let chart = agCharts.AgChart.create(options)

function missingYValues() {
  const data = getData()
  data[2].firefox = undefined
  data[8].chrome = undefined

  options.data = data

  agCharts.AgChart.update(chart, options)
}

function missingXValues() {
  const data = getData()

  data[4].year = undefined
  data[5].year = undefined
  data[6].year = undefined

  options.data = data

  agCharts.AgChart.update(chart, options)
}

function stack() {
  options.series = series.map(s => ({ ...s, stacked: true }))
  agCharts.AgChart.update(chart, options)
}

function group() {
  options.series = series.map(s => ({ ...s, stacked: false }))
  agCharts.AgChart.update(chart, options)
}

function reset() {
  options.data = getData()
  options.series = series
  agCharts.AgChart.update(chart, options)
}
