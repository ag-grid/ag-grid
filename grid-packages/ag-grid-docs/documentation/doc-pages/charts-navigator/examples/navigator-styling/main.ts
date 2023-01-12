import * as agCharts from "ag-charts-community"
import { AgChartOptions } from "ag-charts-community"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  title: {
    text: "Navigator Styling",
  },
  data: getData(),
  series: [
    {
      type: "area",
      xKey: "date",
      yKey: "Tate Modern",
      fill: "#c16068",
      stroke: "#874349",
    },
    {
      type: "area",
      xKey: "date",
      yKey: "Tate Britain",
      fill: "#a2bf8a",
      stroke: "#718661",
    },
    {
      type: "area",
      xKey: "date",
      yKey: "Tate Liverpool",
      fill: "#ebcc87",
      stroke: "#a48f5f",
    },
    {
      type: "area",
      xKey: "date",
      yKey: "Tate St Ives",
      fill: "#80a0c3",
      stroke: "#5a7088",
    },
  ],
  axes: [
    {
      type: "time",
      position: "bottom",
    },
    {
      type: "number",
      position: "left",
      label: {
        formatter: params => {
          return params.value / 1000 + "k"
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
  navigator: {
    height: 50,
    min: 0.2,
    max: 0.7,
    mask: {
      fill: "red",
      strokeWidth: 2,
      fillOpacity: 0.3,
    },
    minHandle: {
      fill: "yellow",
      stroke: "blue",
      width: 16,
      height: 30,
      gripLineGap: 4,
      gripLineLength: 12,
      strokeWidth: 2,
    },
    maxHandle: {
      fill: "lime",
      stroke: "black",
    },
  },
}

var chart = agCharts.AgChart.create(options)
