import { AgChartOptions, AgEnterpriseCharts } from "ag-charts-enterprise"
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

AgEnterpriseCharts.create(options)
