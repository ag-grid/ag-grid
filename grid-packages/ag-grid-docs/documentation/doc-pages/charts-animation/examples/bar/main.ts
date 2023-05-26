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
      type: "bar",
      xKey: "quarter",
      yKey: "iphone",
      yName: "iPhone",
      stackGroup: "Devices",
      label: {
        color: "white",
      },
    },
    {
      type: "bar",
      xKey: "quarter",
      yKey: "mac",
      yName: "Mac",
      stackGroup: "Devices",
    },
    {
      type: "bar",
      xKey: "quarter",
      yKey: "ipad",
      yName: "iPad",
      stackGroup: "Devices",
    },
    {
      type: "bar",
      xKey: "quarter",
      yKey: "wearables",
      yName: "Wearables",
    },
    {
      type: "bar",
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
