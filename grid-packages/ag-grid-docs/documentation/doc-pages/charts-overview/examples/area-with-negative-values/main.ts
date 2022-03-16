import { AgChartOptions } from "ag-charts-community"
import * as agCharts from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ["#FA7921", "#5BC0EB", "#9BC53D", "#E55934", "#FDE74C"],
      strokes: ["#af5517", "#4086a4", "#6c8a2b", "#a03e24", "#b1a235"],
    },
    overrides: {
      area: {
        series: {
          fillOpacity: 0.6,
          highlightStyle: {
            series: {
              strokeWidth: 3,
              dimOpacity: 0.1,
            },
          },
        },
      },
    },
  },
  title: {
    text: "Changes in UK Energy Stock (2018)",
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Department for Business, Energy & Industrial Strategy",
  },
  series: [
    {
      type: "area",
      xKey: "quarter",
      yKey: "naturalGas",
      yName: "Natural gas",
    },
    {
      type: "area",
      xKey: "quarter",
      yKey: "coal",
      yName: "Coal",
    },
    {
      type: "area",
      xKey: "quarter",
      yKey: "primaryOil",
      yName: "Primary oil",
    },
    {
      type: "area",
      xKey: "quarter",
      yKey: "petroleum",
      yName: "Petroleum",
    },
    {
      type: "area",
      xKey: "quarter",
      yKey: "manufacturedFuels",
      yName: "Manufactured fuels",
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
      title: {
        enabled: true,
        text: "Thousand tonnes of oil equivalent",
      },
    },
  ],
  legend: {
    position: "bottom",
  },
}

var chart = agCharts.AgChart.create(options)
