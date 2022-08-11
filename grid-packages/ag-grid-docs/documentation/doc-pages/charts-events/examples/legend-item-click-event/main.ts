import * as agCharts from "ag-charts-community"
import {
  AgCartesianChartOptions,
  AgChartLegendClickEvent,
} from "ag-charts-community"

let options: AgCartesianChartOptions = {
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
};

agCharts.AgChart.create(options);
