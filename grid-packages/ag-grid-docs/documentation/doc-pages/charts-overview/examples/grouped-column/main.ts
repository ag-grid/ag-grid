import { AgChart, AgChartOptions } from "ag-charts-community"
import { getData } from "./data"

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
            item: {
              strokeWidth: 1,
            },
          },
        },
      },
    },
  },
  title: {
    text: "Regular Internet Users",
    fontSize: 18,
    spacing: 25,
  },
  footnote: {
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
        formatter: ({ value }) => `${value / 1000}M`,
      },
    },
  ],
}

var chart = AgChart.create(options)
