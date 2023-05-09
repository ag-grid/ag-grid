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
    { type: "column", xKey: "month", stacked: true, yKey: "value1" },
    { type: "column", xKey: "month", stacked: true, yKey: "hats_made" },
  ],
  tooltip: {
    showArrow: true // default
  },
}

const chart = AgChart.create(options)

function toggleTooltipArrow() {
  options.tooltip!.showArrow = !options.tooltip!.showArrow
  AgChart.update(chart, options)
}
