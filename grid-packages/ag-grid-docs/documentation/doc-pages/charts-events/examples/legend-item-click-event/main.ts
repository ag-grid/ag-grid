import * as agCharts from "ag-charts-community"
import {
  AgCartesianChartOptions,
  AgChartLegendClickEvent,
  AgPolarChartOptions,
  AgChartOptions,
} from "ag-charts-community"
import { getHistogramData } from './data';

const mixin = {
  legend: {
    listeners: {
      legendItemClick: ({
        seriesId,
        itemId,
        enabled,
      }: AgChartLegendClickEvent) => {
        window.alert(
          `seriesId: ${seriesId}, itemId: ${itemId}, enabled: ${enabled}`
        )
      },
    },
  },
}

const cartesianOptions: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: [
    {
      quarter: "Q1",
      petrol: 200,
      diesel: 100,
    },
    {
      quarter: "Q2",
      petrol: 300,
      diesel: 130,
    },
    {
      quarter: "Q3",
      petrol: 350,
      diesel: 160,
    },
    {
      quarter: "Q4",
      petrol: 400,
      diesel: 200,
    },
  ],
  series: [
    {
      xKey: "quarter",
      yKey: "petrol",
    },
    {
      xKey: "quarter",
      yKey: "diesel",
    },
  ],
  axes: [
    { type: "category", position: "bottom" },
    { type: "number", position: "left" },
  ],
  ...mixin,
}

const histogramOptions: AgCartesianChartOptions = {
    container: document.getElementById("myChart"),
    autoSize: true,
    data: getHistogramData(),
    series: [{
        type: 'histogram',
        xKey: 'age',
    }],
    ...mixin,
};

const polarOptions: AgPolarChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: [
    { label: "Android", value: 56.9 },
    { label: "iOS", value: 22.5 },
    { label: "BlackBerry", value: 6.8 },
    { label: "Symbian", value: 8.5 },
    { label: "Bada", value: 2.6 },
    { label: "Windows", value: 1.9 },
  ],
  series: [
    {
      type: "pie",
      angleKey: "value",
      labelKey: "label",
    },
  ],
  ...mixin,
}

let chart: any = agCharts.AgChart.create(cartesianOptions)

function update(type: string) {
  chart.destroy()

  let options: AgChartOptions;
  if (type === 'histogram') {
    options = { ...histogramOptions };
  } else if (type === 'pie') {
    options = { ...polarOptions };
  } else {
    options = { ...cartesianOptions };
    if (options.series) {
        options.series = options.series.map((s: any) => {
          s = { ...s };
          s.type = type;
      
          return s;
        });
    }
  }

  chart = agCharts.AgChart.create(options)
}
