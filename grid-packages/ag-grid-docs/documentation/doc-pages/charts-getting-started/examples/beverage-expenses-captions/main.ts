import { AgChart } from "ag-charts-community"

const data = [
  {
    beverage: "Coffee",
    Q1: 700,
    Q2: 600,
    Q3: 560,
    Q4: 450,
  },
  {
    beverage: "Tea",
    Q1: 520,
    Q2: 450,
    Q3: 380,
    Q4: 270,
  },
  {
    beverage: "Milk",
    Q1: 200,
    Q2: 190,
    Q3: 170,
    Q4: 180,
  },
]

const options: AgChartOptions = {
  data: data,
  container: document.getElementById("myChart"),
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
    {
      type: "column",
      xKey: "beverage",
      yKey: "Q1",
      stacked: true,
      label: {},
    },
    {
      type: "column",
      xKey: "beverage",
      yKey: "Q2",
      stacked: true,
      label: {},
    },
    {
      type: "column",
      xKey: "beverage",
      yKey: "Q3",
      stacked: true,
      label: {},
    },
    {
      type: "column",
      xKey: "beverage",
      yKey: "Q4",
      stacked: true,
      label: {},
    },
  ],
}

AgChart.create(options)
