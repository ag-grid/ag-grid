import {
  AgChart, AgAreaSeriesOptions,
  AgChartLegendPosition,
} from "ag-charts-community"
import { getData } from "./data"

function buildSeries(name: string): AgAreaSeriesOptions {
  return {
    type: "area",
    xKey: "year",
    yKey: name.toLowerCase(),
    yName: name,
    fillOpacity: 0.5,
  }
}

const series = [
  buildSeries("IE"),
  buildSeries("Chrome"),
  buildSeries("Firefox"),
  buildSeries("Safari"),
]

const positions: AgChartLegendPosition[] = ["left", "top", "right", "bottom"]
const legend = {
  position: positions[1],
}

let chart = AgChart.create({
  container: document.getElementById("myChart"),
  title: {
    text: "Browser Usage Statistics",
  },
  subtitle: {
    text: "2009-2019",
  },
  data: getData(),
  series,
  legend,
});

function reverseSeries() {
  // Mutate options.
  const series = chart.getOptions().series as AgAreaSeriesOptions[]
  series!.reverse()

  // Apply changes.
  AgChart.updateDelta(chart, { series })
}

function swapTitles() {
  // Mutate options.
  const { title, subtitle } = chart.getOptions()

  // Apply changes.
  AgChart.updateDelta(chart, { title: subtitle, subtitle: title })
}

function rotateLegend() {
  // Mutate legend.
  const position  = chart.getOptions().legend!.position

  const currentIdx = positions.indexOf(position || "top")
  const newPosition = positions[(currentIdx + 1) % positions.length]

  // Apply changes.
  AgChart.updateDelta(chart, { legend: { position: newPosition } })
}

function changeTheme() {
  AgChart.updateDelta(chart, {
    theme: { overrides: { area: { series: { marker: { enabled: true } } } } },
  })
}
