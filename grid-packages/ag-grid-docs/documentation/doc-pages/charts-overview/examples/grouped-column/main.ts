import * as agCharts from "ag-charts-community";
import { AgChartOptions } from "ag-charts-community";
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      column: {
        series: {
          strokeWidth: 0,
          highlightStyle: {
            strokeWidth: 1,
          },
        },
      },
    },
  },
  title: {
    text: "Regular Internet Users",
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Office for National Statistics",
  },
  series: [
    { type: "column", xKey: "year", yKey: "16-24" },
    { type: "column", xKey: "year", yKey: "25-34" },
    { type: "column", xKey: "year", yKey: "35-44" },
    { type: "column", xKey: "year", yKey: "45-54" },
    { type: "column", xKey: "year", yKey: "55-64" },
    { type: "column", xKey: "year", yKey: "65-74" },
    { type: "column", xKey: "year", yKey: "75+" },
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
        formatter: (params) => {
          const formatted = params.value / 1000 + "M";
          return formatted.indexOf('.') >= 0 ? undefined : formatted;
        },
      },
    },
  ],
}

var chart = agCharts.AgChart.create(options)
