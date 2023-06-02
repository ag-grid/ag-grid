import { AgChartOptions, AgEnterpriseCharts } from "ag-charts-enterprise"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  data: getData(),
  title: {
    text: "Waterfall Bar",
  },
  series: [
    {
      type: "waterfall-bar",
      xKey: "date",
      xName: "Date",
      yKey: "amount",
      yName: "Amount",
      label: {
        enabled: true,
        placement: "inside",
      },
      positiveItem: {
        fill: "#91CC75",
        stroke: "#91CC75",
        name: "Revenue",
      },
      negativeItem: {
        fill: "#D21E75",
        stroke: "#D21E75",
        name: "Product Cost",
      },
      highlightStyle: {
        series: {
          dimOpacity: 0.5,
        },
      },
    },
  ],
  zoom: {
    enabled: true,
  },
  animation: {
    enabled: true,
  },
  legend: {
    enabled: true,
  },
}

AgEnterpriseCharts.create(options)
