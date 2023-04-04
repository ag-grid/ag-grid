import { AgCartesianChartOptions, AgChart } from "ag-charts-community"

function renderer(params: AgCartesianSeriesTooltipRendererParams) {
  return `<div class="ag-chart-tooltip-title" style="background-color: ${
    params.color
  }">
      ${params.xValue}
    </div>
    <div class="ag-chart-tooltip-content">
      <a href="/" target="_top">Go to AG Grid</a> | ${params.yValue.toFixed(0)}
    </div>`
}

const options: AgCartesianChartOptions = {
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
      type: "column",
      xKey: "month",
      yKey: "sweaters",
      yName: "Sweaters Made",
      tooltip: { renderer },
    },
  ],
  tooltip: {
    enableInteraction: true,
  },
}

var chart = AgChart.create(options)
