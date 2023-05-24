import { AgChart, AgChartOptions } from "ag-charts-community"

const data = [
  {
    quarter: "Q1",
    spending: 700,
  },
  {
    quarter: "Q2",
    spending: 600,
  },
  {
    quarter: "Q3",
    spending: 560,
  },
  {
    quarter: "Q4",
    spending: 450,
  },
]

const options: AgChartOptions = {
  data: data,
  container: document.getElementById("myChart"),
  series: [
    {
      xKey: "quarter",
      yKey: "spending",
      yName: "Coffee Spending",
    },
  ],
  legend: {
    enabled: true,
  },
}

AgChart.create(options)
