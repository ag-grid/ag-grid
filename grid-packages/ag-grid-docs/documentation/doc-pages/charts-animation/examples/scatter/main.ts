import { AgChartOptions, AgEnterpriseCharts } from "ag-charts-enterprise"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  animation: {
    enabled: true,
  },
  data: getData(),
  series: [
    {
      type: "scatter",
      xKey: "time",
      yKey: "mm",
    },
  ],
}

AgEnterpriseCharts.create(options)
