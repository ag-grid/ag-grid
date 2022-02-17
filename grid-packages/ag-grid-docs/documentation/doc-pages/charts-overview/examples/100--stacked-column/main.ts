import { AgChartOptions } from "@ag-grid-community/core"
import * as agCharts from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ["#f1c40f", "#e67e22", "#2ecc71", "#3498db", "#9b59b6", "#34495e"],
      strokes: [
        "#f39c12",
        "#d35400",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
      ],
    },
  },
  title: {
    text: "Ethnic Diversity of School Pupils (2019)",
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Department for Education",
  },
  series: [
    {
      type: "column",
      xKey: "type",
      normalizedTo: 100,
      yKey: "white",
      yName: "White",
    },
    {
      type: "column",
      xKey: "type",
      normalizedTo: 100,
      yKey: "mixed",
      yName: "Mixed",
    },
    {
      type: "column",
      xKey: "type",
      normalizedTo: 100,
      yKey: "asian",
      yName: "Asian",
    },
    {
      type: "column",
      xKey: "type",
      normalizedTo: 100,
      yKey: "black",
      yName: "Black",
    },
    {
      type: "column",
      xKey: "type",
      normalizedTo: 100,
      yKey: "chinese",
      yName: "Chinese",
    },
    {
      type: "column",
      xKey: "type",
      normalizedTo: 100,
      yKey: "other",
      yName: "Other",
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
      label: {
        format: "#{.0f}%",
      },
    },
  ],
}

var chart = agCharts.AgChart.create(options)
