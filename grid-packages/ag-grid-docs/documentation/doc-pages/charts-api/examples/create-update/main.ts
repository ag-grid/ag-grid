import * as agCharts from "ag-charts-community"
import { AgChartLegendPosition, AgChartOptions, AgAreaSeriesOptions } from "ag-charts-community"

function series(name: string): AgAreaSeriesOptions {
  return {
      type: "area",
      xKey: "year",
      yKey: name.toLowerCase(),
      yName: name,
      fillOpacity: 0.5,
  };
}

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  title: {
    text: "Browser Usage Statistics",
  },
  subtitle: {
    text: "2009-2019",
  },
  data: getData(),
  series: [
    series('IE'),
    series('Chrome'),
    series('Firefox'),
    series('Safari'),
  ],
  legend: {
    position: "top",
  },
};

let chart = agCharts.AgChart.create(options);

function reverseSeries() {
  options.series = options.series?.reverse();

  agCharts.AgChart.update(chart, options);
}

function swapTitles() {
  const oldTitle = options.title
  options.title = options.subtitle
  options.subtitle = oldTitle

  agCharts.AgChart.update(chart, options);
}

function rotateLegend() {
  const legend = options.legend || {}
  const positions: AgChartLegendPosition[] = ["left", "top", "right", "bottom"]
  const currentIdx = positions.indexOf(legend?.position || "top")
  legend.position = positions[(currentIdx + 1) % positions.length]

  agCharts.AgChart.update(chart, options);
}
