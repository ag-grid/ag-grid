import { AgChart, AgChartOptions } from "ag-charts-community"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  theme: {
    overrides: {
      column: {
        axes: {
          category: {
            groupPaddingInner: 0,
          },
        },
      },
    },
  },
  title: {
    text: "Apple's revenue by product category",
  },
  subtitle: {
    text: "in billion U.S. dollars",
  },
  data: getData(),
  series: [
    {
      type: "column",
      xKey: "year",
      yKey: "NAQ4",
      yName: "Q4",
      stackGroup: "na",
    },
    {
      type: "column",
      xKey: "year",
      yKey: "NAQ3",
      yName: "Q3",
      stackGroup: "na",
    },
    {
      type: "column",
      xKey: "year",
      yKey: "NAQ2",
      yName: "Q2",
      stackGroup: "na",
    },
    {
      type: "column",
      xKey: "year",
      yKey: "NAQ1",
      yName: "Q1",
      stackGroup: "na",
    },
    {
      type: "column",
      xKey: "year",
      yKey: "EURQ4",
      yName: "Q4",
      stackGroup: "eur",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "EURQ3",
      yName: "Q3",
      stackGroup: "eur",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "EURQ2",
      yName: "Q2",
      stackGroup: "eur",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "EURQ1",
      yName: "Q1",
      stackGroup: "eur",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "ASIAQ4",
      yName: "Q4",
      stackGroup: "asia",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "ASIAQ3",
      yName: "Q3",
      stackGroup: "asia",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "ASIAQ2",
      yName: "Q2",
      stackGroup: "asia",
      showInLegend: false,
    },
    {
      type: "column",
      xKey: "year",
      yKey: "ASIAQ1",
      yName: "Q1",
      stackGroup: "asia",
      showInLegend: false,
    },
  ],
}

AgChart.create(options)
