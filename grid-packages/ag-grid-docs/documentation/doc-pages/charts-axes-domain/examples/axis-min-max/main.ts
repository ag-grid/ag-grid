import { AgCartesianChartOptions, AgNumberAxisOptions, AgChart } from "ag-charts-community"

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  data: [
    { os: "Windows", share: 88.07 },
    { os: "macOS", share: 9.44 },
    { os: "Linux", share: 1.87 },
  ],
  series: [
    {
      type: "line",
      xKey: "os",
      yKey: "share",
    },
  ],
  axes: [
    {
      type: "category",
      position: "bottom",
      title: {
        text: "Operating System",
      },
    },
    {
      type: "number",
      position: "left",
      title: {
        text: "Market Share (%)",
      },
    },
  ],
}

const chart = AgChart.create(options)

function setAxisMinMax() {
  const numberAxisOptions = options.axes![1] as AgNumberAxisOptions;
  numberAxisOptions.min = -50;
  numberAxisOptions.max = 150;
  AgChart.update(chart, options);
}

function resetAxisDomain() {
  const numberAxisOptions = options.axes![1] as AgNumberAxisOptions;
  if (numberAxisOptions.min) {
    delete numberAxisOptions.min;
  }
  if (numberAxisOptions.max) {
    delete numberAxisOptions.max;
  }
  AgChart.update(chart, options);
}
