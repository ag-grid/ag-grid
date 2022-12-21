import * as agCharts from "ag-charts-community"
import { AgChartLegendPosition, AgChartOptions } from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  theme: {
    palette: {
      fills: ["#AC9BF5", "#5984C2", "#36A883", "#F5CA46", "#F5546F"],
      strokes: ["#AC9BF5", "#5984C2", "#36A883", "#F5CA46", "#F5546F"],
    },
  },
  data: [
    {
      quarter: "Q1",
      coal: -666,
      manufacturedFuels: -14,
      primaryOil: -261,
      petroleum: -124,
      naturalGas: -1197,
    },
    {
      quarter: "Q2",
      coal: 208,
      manufacturedFuels: 71,
      primaryOil: 950,
      petroleum: -318,
      naturalGas: 906,
    },
    {
      quarter: "Q3",
      coal: 426,
      manufacturedFuels: 19,
      primaryOil: -845,
      petroleum: 166,
      naturalGas: 276,
    },
    {
      quarter: "Q4",
      coal: 158,
      manufacturedFuels: -29,
      primaryOil: -156,
      petroleum: -19,
      naturalGas: 672,
    },
  ],
  series: [
    {
      type: "column",
      xKey: "quarter",
      yKey: "naturalGas",
      yName: "Natural gas",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "coal",
      yName: "Coal",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "primaryOil",
      yName: "Primary oil",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "petroleum",
      yName: "Petroleum",
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "manufacturedFuels",
      yName: "Manufactured fuels",
    },
  ],
  legend: {
    position: "right",
  },
}

var chart = agCharts.AgChart.create(options)

function updateLegendPosition(value: AgChartLegendPosition) {
  options.legend!.position = value
  agCharts.AgChart.update(chart, options)
}

function setLegendEnabled(enabled: boolean) {
  options.legend!.enabled = enabled
  agCharts.AgChart.update(chart, options)
}
