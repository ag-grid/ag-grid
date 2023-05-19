import { AgChart, AgChartOptions, Marker } from "ag-charts-community";
import { getData } from "./data";

var markerSize = 10

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: [
        "#f3622d",
        "#fba71b",
        "#57b757",
        "#41a9c9",
        "#4258c9",
        "#9a42c8",
        "#c84164",
        "#888888",
      ],
      strokes: [
        "#aa4520",
        "#b07513",
        "#3d803d",
        "#2d768d",
        "#2e3e8d",
        "#6c2e8c",
        "#8c2d46",
        "#5f5f5f",
      ],
    },
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
    text: "Taxed Alcohol Consumption (UK)",
    fontSize: 18,
    spacing: 25,
  },
  footnote: {
    text: "Source: HM Revenue & Customs",
  },
  series: [
    {
      type: "line",
      title: "Still wine",
      xKey: "year",
      yKey: "stillWine",
      marker: {
        size: markerSize,
        shape: "circle",
      },
    },
    {
      type: "line",
      title: "Sparkling wine",
      xKey: "year",
      yKey: "sparklingWine",
      marker: {
        size: markerSize,
        shape: "cross",
      },
    },
    {
      type: "line",
      title: "Made-wine",
      xKey: "year",
      yKey: "madeWine",
      marker: {
        size: markerSize,
        shape: "diamond",
      },
    },
    {
      type: "line",
      title: "Whisky",
      xKey: "year",
      yKey: "whisky",
      marker: {
        size: markerSize,
        shape: "plus",
      },
    },
    {
      type: "line",
      title: "Potable spirits",
      xKey: "year",
      yKey: "potableSpirits",
      marker: {
        size: markerSize,
        shape: "square",
      },
    },
    {
      type: "line",
      title: "Beer",
      xKey: "year",
      yKey: "beer",
      marker: {
        size: markerSize,
        shape: "triangle",
      },
    },
    {
      type: "line",
      title: "Cider",
      xKey: "year",
      yKey: "cider",
      marker: {
        size: markerSize,
        shape: heartFactory(),
      },
    },
  ],
  axes: [
    {
      position: "bottom",
      type: "category",
      label: {
        rotation: -30,
      },
    },
    {
      position: "left",
      type: "number",
      title: {
        enabled: true,
        text: "Volume (hectolitres)",
      },
      label: {
        formatter: (params) => {
          return params.value / 1000000 + "M"
        },
      },
    },
  ],
}

var chart = AgChart.create(options)

function heartFactory() {
  class Heart extends Marker {
    rad(degree: number) {
      return (degree / 180) * Math.PI
    }

    updatePath() {
      const { x, path, size, rad } = this
      const r = size / 4
      const y = this.y + r / 2

      path.clear()
      path.arc(x - r, y - r, r, rad(130), rad(330))
      path.arc(x + r, y - r, r, rad(220), rad(50))
      path.lineTo(x, y + r)
      path.closePath()
    }
  }
  return Heart
}
