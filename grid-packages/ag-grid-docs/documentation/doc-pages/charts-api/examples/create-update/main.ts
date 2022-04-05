import * as agCharts from "ag-charts-community"
import { AgChartLegendPosition, AgChartOptions } from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  title: {
    text: "Microsoft Internet Explorer vs Google Chrome",
  },
  subtitle: {
    text: "2009-2019",
  },
  data: getData(),
  series: [
    {
      type: "area",
      xKey: "year",
      yKey: "ie",
      yName: "IE",
      fillOpacity: 0.7,
    },
    {
      type: "area",
      xKey: "year",
      yKey: "chrome",
      yName: "Chrome",
      fillOpacity: 0.7,
    },
  ],
  legend: {
    position: "top",
  },
}

let chart = agCharts.AgChart.create(options)

function reverseSeries() {
  options.series = options.series?.reverse()
  agCharts.AgChart.update(chart, options)
}

function swapTitles() {
  const oldTitle = options.title
  options.title = options.subtitle
  options.subtitle = oldTitle

  agCharts.AgChart.update(chart, options)
}

function rotateLegend() {
  const legend = options.legend || {}
  const positions: AgChartLegendPosition[] = ["left", "top", "right", "bottom"]
  const currentIdx = positions.indexOf(legend?.position || "top")
  legend.position = positions[(currentIdx + 1) % positions.length]

  agCharts.AgChart.update(chart, options)
}
