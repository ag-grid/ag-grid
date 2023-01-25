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
}

var chart = AgChart.create(options)

function setYNames() {
  options.series![0].yName = "Sweaters Made";
  options.series![1].yName = "Hats Made";
  AgChart.update(chart, options)
}

function resetYNames() {
  options.series![0].yName = undefined;;
  options.series![1].yName = undefined;;
  AgChart.update(chart, options)
}
