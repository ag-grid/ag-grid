import * as agCharts from "ag-charts-community"
import { AgChartLegendPosition, AgChartOptions, AgAreaSeriesOptions } from "ag-charts-community"

function buildSeries(name: string): AgAreaSeriesOptions {
  return {
      type: "area",
      xKey: "year",
      yKey: name.toLowerCase(),
      yName: name,
      fillOpacity: 0.5,
  };
}

const series = [
  buildSeries('IE'),
  buildSeries('Chrome'),
  buildSeries('Firefox'),
  buildSeries('Safari'),
];

const positions: AgChartLegendPosition[] = ["left", "top", "right", "bottom"]
const legend = {
  position: positions[1],
};

const options: AgChartOptions = {
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
};

let chart = agCharts.AgChart.create(options);

function reverseSeries() {
  // Mutate options.
  options.series = series.reverse();

  // Apply changes.
  agCharts.AgChart.update(chart, options);
}

function swapTitles() {
  // Mutate options.
  const oldTitle = options.title
  options.title = options.subtitle
  options.subtitle = oldTitle

  // Apply changes.
  agCharts.AgChart.update(chart, options);
}

function rotateLegend() {
  // Mutate legend.
  const currentIdx = positions.indexOf(legend.position || "top")
  legend.position = positions[(currentIdx + 1) % positions.length];

  // Apply changes.
  options.legend = legend;
  agCharts.AgChart.update(chart, options);
}
