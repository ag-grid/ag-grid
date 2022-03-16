import { AgCartesianSeriesTooltipRendererParams } from "ag-charts-community"
import { AgChartOptions } from "ag-charts-community"
import * as agCharts from "ag-charts-community"

function tooltipRenderer(params: AgCartesianSeriesTooltipRendererParams) {
  var formatThousands = function (value: number) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  var tooltipHtml = [
    '<div class="my-tooltip">',
    '<span class="my-tooltip__title" style="color: ' +
    params.color +
    '">' +
    params.yName,
    "(" +
    params.datum[params.xKey] +
    "):</span> " +
    formatThousands(params.datum[params.yKey]) +
    " tonnes",
    "</div>",
  ]

  return tooltipHtml.join("\n")
}

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      column: {
        series: {
          strokeWidth: 0,
          tooltip: {
            renderer: tooltipRenderer,
          },
        },
      },
    },
  },
  title: {
    text: "WEEE Collected in UK (2019)",
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Environmental Agency",
  },
  tooltip: {
    class: "my-tooltip",
  },
  series: [
    {
      type: "column",
      xKey: "quarter",
      yKey: "largeHousehold",
      yName: "Large household appliances",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "smallHousehold",
      yName: "Small household appliances",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "itTelecomms",
      yName: "IT and telecomms equipment",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "consumer",
      yName: "Consumer equipment",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "tools",
      yName: "Electrical and electronic tools",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "displays",
      yName: "Display equipment",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "cooling",
      yName: "Cooling appliances containing refrigerants",
      stacked: true,
    },
    {
      type: "column",
      xKey: "quarter",
      yKey: "gasLampsLed",
      yName: "Gas discharge lamps and LED light sources",
      stacked: true,
    },
  ],
  axes: [
    {
      type: "category",
      position: "bottom",
    },
    {
      type: "number",
      position: "left",
      title: {
        enabled: true,
        text: "Waste collected (tonnes)",
      },
      label: {
        formatter: function (params) {
          return params.value / 1000 + "k"
        },
      },
    },
  ],
  legend: {
    position: "bottom",
  },
}

var chart = agCharts.AgChart.create(options)
