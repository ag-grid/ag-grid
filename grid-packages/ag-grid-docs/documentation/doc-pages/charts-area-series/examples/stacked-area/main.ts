import { AgChartOptions } from "ag-charts-community"
import * as agCharts from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  title: {
    text: "Browser Wars",
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
      stacked: true,
    },
    {
      type: "area",
      xKey: "year",
      yKey: "firefox",
      yName: "Firefox",
      stacked: true,
    },
    {
      type: "area",
      xKey: "year",
      yKey: "safari",
      yName: "Safari",
      stacked: true,
    },
    {
      type: "area",
      xKey: "year",
      yKey: "chrome",
      yName: "Chrome",
      stacked: true,
    },
  ],
}

agCharts.AgChart.create(options)
