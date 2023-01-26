import { AgChart, AgChartLegendPosition, AgChartOptions } from "ag-charts-community"
import { getData } from "./data"

const colors = [
  "#AC9BF5",
  "#5984C2",
  "#36A883",
  "#F5CA46",
  "#F5546F",
  "#8B6FB8",
  "#E8A7F0",
  "#7BAFDF",
  "#65CC8D",
  "#F57940",
  "#B2DB6A",
  "#32B33B",
  "#758080",
  "#284E8F",
  "#F5BFAE",
  "#D65653",
  "#B3AC4C",
  "#758080",
  "#A0CEF5",
  "#357A72",
]

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  theme: {
    palette: {
      fills: colors,
      strokes: colors,
    },
    overrides: {
      cartesian: {
        series: {
          line: {
            marker: {
              enabled: false,
            },
          },
        },
      },
    },
  },
  title: {
    text: `Renewable sources used to generate electricity for transport fuels`,
  },
  data: getData(),
  series: [
    {
      type: "line",
      xKey: "year",
      yKey: "Onshore wind",
      yName: "Onshore Wind",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Offshore wind",
      yName: "Offshore Wind",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Marine energy",
      yName: "Marine Energy",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Solar photovoltaics",
      yName: "Solar Photovoltaics",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Small cale Hydro",
      yName: "Small Scale Hydro",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Large scale Hydro",
      yName: "Large Scale Hydro",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Plant biomass",
      yName: "Plant Biomass",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Animal biomass",
      yName: "Animal Biomass",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Landfill gas",
      yName: "Landfill Gas",
    },
    {
      type: "line",
      xKey: "year",
      yKey: "Sewage gas",
      yName: "Sewage Gas",
    },
  ],
  axes: [
    {
      position: "bottom",
      type: "time",
      gridStyle: [],
    },
    {
      position: "right",
      type: "number",
      title: {
        text: `kilotonnes of oil equivalent (ktoe)`,
      },
      label: {
        formatter: params => `${params.value / 1000}K`,
      },
      line: {
        width: 0,
      },
      tick: {
        count: 5,
      },
    },
  ],
  legend: {
    position: "bottom",
    maxHeight: 40,
    maxWidth: 800,
    pagination: {
      marker: {
        size: 10,
      },
      activeStyle: {
        fill: "#284E8F",
      },
      inactiveStyle: {
        fillOpacity: 0.5,
      },
      highlightStyle: {
        fill: "#7BAFDF",
      },
      label: {
        color: "rgb(87, 87, 87)",
      },
    },
  },
}

var chart = AgChart.create(options)

function updateLegendPosition(value: AgChartLegendPosition) {
  options.legend!.position = value
  switch (value) {
    case "top":
    case "bottom":
      options.legend!.maxHeight = 40
      options.legend!.maxWidth = 800
      break
    case "right":
    case "left":
      options.legend!.maxHeight = 200
      options.legend!.maxWidth = 200
      break
  }

  AgChart.update(chart, options)
}
