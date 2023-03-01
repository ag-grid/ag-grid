import { AgChart, AgChartOptions } from "ag-charts-community"
import { data } from "./data"

const year = new Date().getFullYear();
const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  theme: {
    palette: {
      fills: ["#5BC0EB", "#FDE74C", "#9BC53D", "#E55934", "#FA7921", "#fa3081"],
      strokes: [
        "#5BC0EB",
        "#FDE74C",
        "#9BC53D",
        "#E55934",
        "#FA7921",
        "#fa3081",
      ],
    },
    overrides: {
      line: { series: { strokeWidth: 3, marker: { enabled: false } } },
    },
  },
  autoSize: true,
  title: {
    text: `Earthquake Magnitudes by Source (January ${year - 1})`,
    fontSize: 18,
  },
  subtitle: {
    text: "Source: US Geological Survey",
  },
  padding: {
    left: 40,
    right: 40,
  },
  series: [
    {
      data: data.ci,
      type: "line",
      title: "Southern California Seismic Network",
      xKey: "time",
      yKey: "magnitude",
    },
    {
      data: data.hv,
      type: "line",
      title: "Hawaiian Volcano Observatory Network",
      xKey: "time",
      yKey: "magnitude",
    },
    {
      data: data.nc,
      type: "line",
      title: "USGS Northern California Network",
      xKey: "time",
      yKey: "magnitude",
    },
    {
      data: data.ok,
      type: "line",
      title: "Oklahoma Seismic Network",
      xKey: "time",
      yKey: "magnitude",
    },
  ],
  axes: [
    {
      position: "bottom",
      type: "time",
      label: {
        format: "%d/%m",
      },
    },
    {
      position: "left",
      type: "number",
      title: {
        text: "Magnitude",
      },
    },
  ],
  legend: {
    position: "bottom",
    item: {
      marker: {
        strokeWidth: 0,
      },
    },
  },
}

var chart = AgChart.create(options)
