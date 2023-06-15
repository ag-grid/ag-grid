import {
  AgChart,
  AgChartOptions,
  AgEnterpriseCharts,
} from "ag-charts-enterprise"
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

const chart = AgEnterpriseCharts.create(options)

function reset() {
  AgChart.update(chart, {
    ...options,
    data: getData(),
  } as any)
}

function randomise() {
  AgChart.update(chart, {
    ...options,
    data: [
      ...getData().map((d: any) => ({
        ...d,
        iphone: d.iphone + Math.floor(Math.random() * 50 - 25),
      })),
    ],
  } as any)
}

function remove() {
  AgChart.update(chart, {
    ...options,
    data: [
      ...getData().filter(
        (d: any) =>
          !d.quarter.startsWith("Q1'19") &&
          !d.quarter.startsWith("Q3'19") &&
          !d.quarter.startsWith("Q4'18")
      ),
    ],
  } as any)
}
