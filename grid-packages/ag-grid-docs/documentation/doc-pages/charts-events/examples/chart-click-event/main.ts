import {
  AgChart,
  AgChartClickEvent,
  AgChartDoubleClickEvent,
  AgChartOptions,
} from "ag-charts-community"

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  title: {
    text: "Number of Cars Sold",
  },
  subtitle: {
    text: "(click a column for details)",
  },
  data: [
    { month: "March", units: 25, brands: { BMW: 10, Toyota: 15 } },
    { month: "April", units: 27, brands: { Ford: 17, BMW: 10 } },
    { month: "May", units: 42, brands: { Nissan: 20, Toyota: 22 } },
  ],
  series: [
    {
      type: "column",
      xKey: "month",
      yKey: "units",
    },
  ],
  axes: [
    {
      type: "category",
      position: "bottom",
    },
    {
      type: "number",
      position: "left",
    },
  ],
  legend: {
    enabled: false,
  },
  listeners: {
    click: (_event: AgChartClickEvent) => {
      console.log("click")
    },
    doubleClick: (_event: AgChartDoubleClickEvent) => {
      console.log("double click")
    },
  },
}

AgChart.create(options)
