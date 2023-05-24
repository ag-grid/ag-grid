import { AgChartOptions, AgEnterpriseCharts } from "ag-charts-enterprise"
import { femaleHeightWeight, maleHeightWeight } from "./data"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  animation: {
    enabled: true,
  },
  series: [
    {
      type: "scatter",
      title: "Male",
      data: maleHeightWeight,
      xKey: "height",
      xName: "Height",
      yKey: "weight",
      yName: "Weight",
      sizeKey: "age",
      sizeName: "Age",
      labelKey: "name",
      marker: {
        shape: "square",
        size: 6,
        maxSize: 30,
        fill: "rgba(227,111,106,0.71)",
        stroke: "#9f4e4a",
      },
      label: {
        enabled: true,
      },
    },
    {
      type: "scatter",
      title: "Female",
      data: femaleHeightWeight,
      xKey: "height",
      xName: "Height",
      yKey: "weight",
      yName: "Weight",
      sizeKey: "age",
      sizeName: "Age",
      labelKey: "name",
      marker: {
        size: 6,
        maxSize: 30,
        fill: "rgba(123,145,222,0.71)",
        stroke: "#56659b",
      },
      label: {
        enabled: true,
      },
    },
  ],
}

AgEnterpriseCharts.create(options)
