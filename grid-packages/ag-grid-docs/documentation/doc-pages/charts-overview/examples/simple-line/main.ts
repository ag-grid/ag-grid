import { AgCartesianSeriesTooltipRendererParams, AgChart, AgChartOptions, AgTooltipRendererResult, time } from "ag-charts-community"
import { getData } from "./data"

const dateFormatter = new Intl.DateTimeFormat("en-US")
const tooltip = {
  renderer: ({
    title,
    xValue,
    yValue,
  }: AgCartesianSeriesTooltipRendererParams): AgTooltipRendererResult => ({
    title,
    content: `${dateFormatter.format(xValue)}: ${yValue}`,
  }),
}

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      line: {
        series: {
          highlightStyle: {
            series: {
              strokeWidth: 3,
              dimOpacity: 0.2,
            },
          },
        },
      },
    },
  },
  title: {
    text: "Road fuel prices",
    fontSize: 18,
  },
  footnote: {
    text: "Source: Department for Business, Energy & Industrial Strategy",
  },
  series: [
    {
      type: "line",
      xKey: "date",
      yKey: "petrol",
      stroke: "#01c185",
      marker: {
        stroke: "#01c185",
        fill: "#01c185",
      },
      tooltip,
    },
    {
      type: "line",
      xKey: "date",
      yKey: "diesel",
      stroke: "#000000",
      marker: {
        stroke: "#000000",
        fill: "#000000",
      },
      tooltip,
    },
  ],
  axes: [
    {
      position: "bottom",
      type: "time",
      tick: {
        interval: time.month.every(2),
      },
      title: {
        text: "Date",
      },
    },
    {
      position: "left",
      type: "number",
      title: {
        text: "Price in pence",
      },
    },
  ],
}

var chart = AgChart.create(options)
