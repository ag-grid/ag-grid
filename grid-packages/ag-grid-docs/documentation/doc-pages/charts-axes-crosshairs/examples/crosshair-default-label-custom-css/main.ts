import {
  AgCartesianChartOptions,
  AgEnterpriseCharts,
} from "ag-charts-enterprise"
import { getData } from "./data"

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  series: [
    {
      type: "scatter",
      sizeKey: "planetRadius",
      yKey: "equilibriumTemp",
      xKey: "distance",
      highlightStyle: {
        item: {
          fill: "white",
          stroke: "rgb(103,105,235)",
        },
      },
      marker: {
        stroke: "white",
        fill: "rgb(103,105,235)",
      },
    },
  ],
  axes: [
    {
      type: "number",
      position: "right",
      title: {
        text: "Equilibrium Temperature [K]",
      },
      crosshair: {
        label: {
          className: "custom-crosshair-label",
          xOffset: 60,
        },
      },
    },
    {
      type: "number",
      position: "bottom",
      title: {
        text: "Distance [pc]",
      },
      crosshair: {
        label: {
          className: "custom-crosshair-label",
          yOffset: 35,
        },
      },
    },
  ],
}

AgEnterpriseCharts.create(options)
