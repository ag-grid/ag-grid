import { AgChart, AgChartOptions } from "ag-charts-community";
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.querySelector("#myChart") as HTMLElement,
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ["#c16068", "#a2bf8a", "#80a0c3"],
      strokes: ["#c16068", "#a2bf8a", "#80a0c3"],
    },
  },
  title: {
    text: "Cattle Holdings and Beef Exports (UK)",
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Department for Environment, Food & Rural Affairs",
  },
  series: [
    {
      type: "column",
      xKey: "year",
      yKey: "male",
      yName: "Male cattle",
      grouped: true,
      strokeWidth: 0,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "female",
      yName: "Female cattle",
      grouped: true,
      strokeWidth: 0,
    },
    {
      type: "line",
      xKey: "year",
      yKey: "exportedTonnes",
      yName: "Beef exports",
      strokeWidth: 5,
      marker: {
        enabled: false,
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
        text: "Number of cattle",
      },
      label: {
        formatter: (params) => {
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
        formatter: (params) => {
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

var chart = AgChart.create(options)
