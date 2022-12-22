import * as agCharts from "ag-charts-community"
import { AgChartLegendClickEvent, AgChartOptions } from "ag-charts-community"
import { getData } from './data';

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
          scatter: {
            marker: {
              fillOpacity: 0,
              strokeWidth: 2
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
      type: "scatter",
      xKey: "year",
      yKey: "Onshore wind",
      sizeKey: "Onshore wind percent",
      yName: "Onshore Wind",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Offshore wind",
      sizeKey: "Offshore wind percent",
      yName: "Offshore Wind",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Marine energy",
      sizeKey: "Marine energy percent",
      yName: "Marine Energy",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Solar photovoltaics",
      sizeKey: "Solar photovoltaics percent",
      yName: "Solar Photovoltaics",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Small cale Hydro",
      sizeKey: "Small cale Hydro percent",
      yName: "Small Scale Hydro",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Large scale Hydro",
      sizeKey: "Large scale Hydro percent",
      yName: "Large Scale Hydro",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Plant biomass",
      sizeKey: "Plant biomass percent",
      yName: "Plant Biomass",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Animal biomass",
      sizeKey: "Animal biomass percent",
      yName: "Animal Biomass",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Landfill gas",
      sizeKey: "Landfill gas percent",
      yName: "Landfill Gas",
    },
    {
      type: "scatter",
      xKey: "year",
      yKey: "Sewage gas",
      sizeKey: "Sewage gas percent",
      yName: "Sewage Gas",
    },
  ],
  axes: [
    {
      position: "bottom",
      type: "time",
      gridStyle: [],
      label: {
        padding: 15
      }
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
    position: "left",
    seriesToggleEnabled: false,
    listeners: {
        legendItemClick: ({
            seriesId,
            itemId,
            enabled,
        }: AgChartLegendClickEvent) => {
            window.alert(
                `seriesId: ${seriesId}, itemId: ${itemId}, enabled: ${enabled}`
            );
        }
    },
    item: {
      marker: {
        strokeWidth: 2,
      }
    }
  },
}

agCharts.AgChart.create(options)