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
      type: "column",
      xKey: "quarter",
      yKey: "iphone",
      yName: "iPhone",
      stackGroup: "Devices",
      label: {
        color: "white",
      },
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "mac",
      yName: "Mac",
      stackGroup: "Devices",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "ipad",
      yName: "iPad",
      stackGroup: "Devices",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "wearables",
      yName: "Wearables",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "services",
      yName: "Services",
      label: {
        color: "white",
      },
    },
  ],
}

AgEnterpriseCharts.create(options)
