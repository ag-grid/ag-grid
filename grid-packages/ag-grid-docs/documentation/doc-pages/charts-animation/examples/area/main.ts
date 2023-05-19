import { AgChartOptions, AgEnterpriseCharts } from "ag-charts-enterprise"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  animation: {
    enabled: true,
  },
  legend: {
    enabled: false,
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

AgEnterpriseCharts.create(options)
