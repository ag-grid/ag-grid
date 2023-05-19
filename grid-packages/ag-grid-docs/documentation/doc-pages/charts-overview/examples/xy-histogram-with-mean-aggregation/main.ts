import { AgChart, AgChartOptions } from "ag-charts-community"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  title: {
    text: "Vehicle fuel efficiency by engine size",
    fontSize: 18,
  },
  subtitle: {
    text: "USA 1987",
  },
  footnote: {
    text: "Source: UCI",
  },
  series: [
    {
      type: "histogram",
      xKey: "engine-size",
      xName: "Engine Size",
      yKey: "highway-mpg",
      yName: "Highway MPG",
      fill: "#41874b",
      stroke: "#41874b",
      fillOpacity: 0.5,
      aggregation: "mean",
    },
    {
      type: "scatter",
      xKey: "engine-size",
      xName: "Engine Size",
      yKey: "highway-mpg",
      yName: "Highway MPG",
    },
  ],
  axes: [
    {
      position: "bottom",
      type: "number",
      title: {
        enabled: true,
        text: "Engine Size (Cubic inches)",
      },
    },
    {
      position: "left",
      type: "number",
      title: {
        text: "Highway MPG",
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
