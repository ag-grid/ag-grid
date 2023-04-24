import { AgChartOptions, AgChart } from "ag-charts-community"

var data = [
  {
    beverage: "Coffee",
    Q1: 450,
    Q2: 560,
    Q3: 600,
    Q4: 700,
  },
  {
    beverage: "Tea",
    Q1: 270,
    Q2: 380,
    Q3: 450,
    Q4: 520,
  },
  {
    beverage: "Milk",
    Q1: 180,
    Q2: 170,
    Q3: 190,
    Q4: 200,
  },
]

const options: AgChartOptions = {
  data: data,
  container: document.body,
  theme: {
    overrides: {
      column: {
        series: {
          highlightStyle: {
            item: {
              fill: "red",
              stroke: "maroon",
              strokeWidth: 4,
            },
            series: {
              dimOpacity: 0.2,
              strokeWidth: 2,
            },
          },
        },
      },
    },
  },
  title: {
    text: "Beverage Expenses",
  },
  subtitle: {
    text: "per quarter",
  },
  footnote: {
    text: "Based on a sample size of 200 respondents",
  },
  series: [
    { type: 'column', xKey: 'beverage', yKey: 'Q1', stacked: true },
    { type: 'column', xKey: 'beverage', yKey: 'Q2', stacked: true },
    { type: 'column', xKey: 'beverage', yKey: 'Q3', stacked: true },
    { type: 'column', xKey: 'beverage', yKey: 'Q4', stacked: true },
  ],
}

AgChart.create(options)
