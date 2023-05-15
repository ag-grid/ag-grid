import { AgCartesianChartOptions, AgChart } from "ag-charts-community"

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  data: [
    {
      month: "Jun",
      value1: 50,
      hats_made: 40,
    },
    {
      month: "Jul",
      value1: 70,
      hats_made: 50,
    },
    {
      month: "Aug",
      value1: 60,
      hats_made: 30,
    },
  ],
  series: [
    {
      type: "column",
      xKey: "month",
      stacked: true,
      yKey: "value1",
      yName: "Sweaters Made",
    },
    {
      type: "column",
      xKey: "month",
      stacked: true,
      yKey: "hats_made",
      yName: "Hats Made",
    },
  ],
  tooltip: {
    showArrow: true,
  },
}

const chart = AgChart.create(options)

function toggleTooltipArrow() {
  options.tooltip!.showArrow = !options.tooltip!.showArrow
  AgChart.update(chart, options)
}
