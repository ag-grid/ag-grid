import { AgChartOptions, AgChartTheme , AgChart } from "ag-charts-community"

var myTheme: AgChartTheme = {
  baseTheme: "ag-default-dark",
  palette: {
    fills: ["#5C2983", "#0076C5", "#21B372", "#FDDE02", "#F76700", "#D30018"],
    strokes: ["black"],
  },
  overrides: {
    cartesian: {
      title: {
        fontSize: 24,
      },
      series: {
        column: {
          label: {
            enabled: true,
            color: "black",
          },
        },
      },
    },
  },
}

const options: AgChartOptions = {
  theme: myTheme,

  container: document.getElementById("myChart"),
  autoSize: true,
  padding: {
    left: 70,
    right: 70,
  },
  title: {
    text: "Custom Chart Theme Example",
  },
  data: [
    { label: "Android", v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
    { label: "iOS", v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
    { label: "BlackBerry", v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
    { label: "Symbian", v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
    { label: "Windows", v1: 2.8, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.8 },
  ],
  series: [
    { type: "column", xKey: "label", yKey: "v1", stacked: true, yName: "Reliability" },
    { type: "column", xKey: "label", yKey: "v2", stacked: true, yName: "Ease of use" },
    { type: "column", xKey: "label", yKey: "v3", stacked: true, yName: "Performance" },
    { type: "column", xKey: "label", yKey: "v4", stacked: true, yName: "Price" },
    { type: "column", xKey: "label", yKey: "v5", stacked: true, yName: "Market share" },
  ],
}

var chart = AgChart.create(options)

/** inScope */
function applyTheme(theme: AgChartTheme) {
  options.theme = theme
  AgChart.update(chart, options)
}
