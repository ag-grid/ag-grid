import * as agCharts from "ag-charts-community";
import { AgAreaSeriesOptions, AgChartLegendPosition, AgChartOptions } from "ag-charts-community";
import { getData } from "./data";


function buildSeries(name: string): AgAreaSeriesOptions {
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
    buildSeries('IE'),
    buildSeries('Chrome'),
    buildSeries('Firefox'),
    buildSeries('Safari'),
  ],
  legend: { position: 'top' },
};

let chart = agCharts.AgChart.create(options);

function download() {
  agCharts.AgChart.download(chart, options);
}

function downloadFixedSize() {
  agCharts.AgChart.download(chart, { width: 600, height: 300 });
}
