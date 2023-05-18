import { AgChartOptions, AgEnterpriseCharts } from "ag-charts-enterprise"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  animation: {
    enabled: true,
  },
  data: [
    { value: 56.9 },
    { value: 22.5 },
    { value: 6.8 },
    { value: 8.5 },
    { value: 2.6 },
    { value: 1.9 },
  ],
  series: [
    {
      type: "pie",
      angleKey: "value",
    },
  ],
}

AgEnterpriseCharts.create(options)
