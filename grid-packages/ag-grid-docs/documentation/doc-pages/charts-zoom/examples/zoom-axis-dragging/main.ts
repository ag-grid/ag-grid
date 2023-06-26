import {
  AgCartesianChartOptions,
  AgEnterpriseCharts,
} from "ag-charts-enterprise"
import { getData } from "./data"

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  title: {
    text: "Average expenditure on coffee",
  },
  subtitle: {
    text: "per person per week in Krakozhia",
  },
  zoom: {
    enabled: true,
  },
  tooltip: {
    enabled: false,
  },
  axes: [
    {
      type: "number",
      position: "left",
      title: {
        text: "Spending",
      },
      keys: ["spending"],
    },
    {
      type: "number",
      position: "right",
      title: {
        text: "Tonnes",
      },
      keys: ["tonnes"],
    },
    {
      type: "number",
      position: "bottom",
      nice: false,
      label: {
        autoRotate: false,
      },
    },
  ],
  data: getData(),
  series: [
    {
      type: "line",
      xKey: "year",
      yKey: "spending",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "tonnes",
    },
  ],
}

AgEnterpriseCharts.create(options)
