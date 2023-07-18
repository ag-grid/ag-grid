import {
  AgChart,
  AgChartOptions,
  AgEnterpriseCharts,
} from "ag-charts-enterprise"
import { getData } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  animation: {
    enabled: true,
  },
  data: getData(),
  series: [
    {
      type: "histogram",
      xKey: "age",
      xName: "Participant Age",
      yKey: "winnings",
      yName: "Winnings",
      aggregation: "sum",
      label: {
        color: "white",
      },
    },
  ],
  axes: [
    {
      type: "number",
      position: "bottom",
      title: { text: "Age band (years)" },
      tick: { interval: 2 },
    },
    {
      type: "number",
      position: "left",
      title: { text: "Total winnings (USD)" },
    },
  ],
}

const chart = AgEnterpriseCharts.create(options)

function reset() {
  options.data = getData()
  AgChart.update(chart, options as any)
}

function randomise() {
  options.data = [
    ...getData().map((d: any) => ({
      ...d,
      age: Math.max(
        17,
        Math.min(33, d.age + Math.floor(Math.random() * 4) - 2)
      ),
    })),
  ]
  AgChart.update(chart, options as any)
}

function remove() {
  options.data = [
    ...getData().filter((d: any) => (d.age < 20 || d.age >= 22) && d.age < 32),
  ]
  AgChart.update(chart, options as any)
}
