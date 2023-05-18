import { AgChart, AgChartOptions } from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  data: [
    {
      month: "Jun",
      sweaters: 50,
    },
    {
      month: "Jul",
      sweaters: 70,
    },
    {
      month: "Aug",
      sweaters: 60,
    },
  ],
  series: [
    {
      type: "line",
      xKey: "month",
      yKey: "sweaters",
      yName: "Sweaters Made",
    },
  ],
  tooltip: {
    showArrow: false,
    position: {
      type: "pointer",
      xOffset: 80,
      yOffset: 80,
    },
  },
}

var chart = AgChart.create(options)
