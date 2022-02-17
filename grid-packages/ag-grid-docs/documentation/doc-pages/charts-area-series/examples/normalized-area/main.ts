import { AgChartOptions } from "@ag-grid-community/core"
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
      normalizedTo: 100,
      yKey: "ie",
      yName: "IE",
    },
    {
      type: "area",
      xKey: "year",
      normalizedTo: 100,
      yKey: "firefox",
      yName: "Firefox",
    },
    {
      type: "area",
      xKey: "year",
      normalizedTo: 100,
      yKey: "safari",
      yName: "Safari",
    },
    {
      type: "area",
      xKey: "year",
      normalizedTo: 100,
      yKey: "chrome",
      yName: "Chrome",
    },
  ],
}

agCharts.AgChart.create(options)
