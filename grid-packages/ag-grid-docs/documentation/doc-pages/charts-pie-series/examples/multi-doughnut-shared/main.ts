import { AgChart, AgChartOptions } from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  data: [
    { os: "Android", "2020": 56.9, "2023": 63.9 },
    { os: "iOS", "2020": 22.5, "2023": 16.5 },
    { os: "BlackBerry", "2020": 6.8, "2023": 2.8 },
    { os: "Symbian", "2020": 8.5, "2023": 2.5 },
    { os: "Bada", "2020": 2.6, "2023": 0.6 },
    { os: "Windows", "2020": 1.9, "2023": 0.9 },
  ],
  legend: {
    mergeMatchingItems: true,
  },
  series: [
    {
      type: "pie",
      calloutLabelKey: "os",
      legendItemKey: "os",
      angleKey: "2023",
      innerRadiusRatio: 0.7,
    },
    {
      type: "pie",
      legendItemKey: "os",
      angleKey: "2020",
      outerRadiusRatio: 0.6,
      innerRadiusRatio: 0.3,
    },
  ],
}

AgChart.create(options)
