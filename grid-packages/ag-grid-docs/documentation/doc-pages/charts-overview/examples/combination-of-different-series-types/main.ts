import { AgChartOptions } from "@ag-grid-community/core"
import * as agCharts from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  title: {
    text: "Cattle Holdings and Beef Exports (UK)",
    fontSize: 18,
  },
  subtitle: {
    text:
      "Source: Department for Environment, Food & Rural Affairs; Agriculture and Horticulture Development Board",
  },
  series: [
    {
      type: "column",
      xKey: "year",
      grouped: true,
      fills: ["#c16068", "#a2bf8a"],
      strokeWidth: 0,
      yKey: "male",
      yName: "Male cattle",
    },
    {
      type: "column",
      xKey: "year",
      grouped: true,
      fills: ["#c16068", "#a2bf8a"],
      strokeWidth: 0,
      yKey: "female",
      yName: "Female cattle",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "exportedTonnes",
      yName: "Beef exports",
      stroke: "#80a0c3",
      strokeWidth: 5,
      marker: {
        enabled: false,
        fill: "#80a0c3",
      },
    },
  ],
  axes: [
    {
      type: "category",
      position: "bottom",
    },
    {
      type: "number",
      position: "left",
      keys: ["male", "female"],
      title: {
        enabled: true,
        text: "Number of cattle",
      },
      label: {
        formatter: function (params) {
          return params.value / 1000 + "M"
        },
      },
    },
    {
      type: "number",
      position: "right",
      keys: ["exportedTonnes"],
      title: {
        enabled: true,
        text: "Exports (tonnes)",
      },
      label: {
        formatter: function (params) {
          return params.value / 1000 + "k"
        },
      },
    },
  ],
  legend: {
    position: "bottom",
    item: {
      marker: {
        shape: "square",
        strokeWidth: 0,
      },
    },
  },
}

var chart = agCharts.AgChart.create(options)
