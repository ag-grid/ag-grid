import { AgChart, AgChartOptions } from "ag-charts-community"

// const tooltipRenderer = ({ datum, color, sectorLabelKey }) => {
//   return [
//     `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">`,
//     datum["year"],
//     `</div>`,
//     `<div style="padding: 4px 8px;">`,
//     `  <strong>${datum["browser"]}:</strong> ${numFormatter.format(
//       datum[sectorLabelKey!]
//     )}`,
//     `</div>`,
//   ].join("\n")
// }

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  data: [
    { browser: "Chrome", "2020": 0.6869, "2022": 0.6695 },
    { browser: "Edge", "2020": 0.0463, "2022": 0.1086 },
    { browser: "Safari", "2020": 0.087, "2022": 0.0891 },
    { browser: "Firefox", "2020": 0.0955, "2022": 0.0757 },
    { browser: "Other", "2020": 0.0843, "2022": 0.0681 },
  ],
  series: [
    {
      type: "pie",
      calloutLabelKey: "browser",
      legendItemKey: "browser",
      angleKey: "2022",
      innerRadiusRatio: 0.7,
      // tooltip: {
      //   renderer: tooltipRenderer,
      // },
    },
    {
      type: "pie",
      legendItemKey: "browser",
      angleKey: "2020",
      outerRadiusRatio: 0.6,
      innerRadiusRatio: 0.3,
      // tooltip: {
      //   renderer: tooltipRenderer,
      // },
    },
  ],
}

AgChart.create(options)
