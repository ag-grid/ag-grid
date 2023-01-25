import { AgChart, AgChartOptions } from "ag-charts-community";
import { getData } from "./data";


const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  theme: {
    palette: { fills: ["#f3622d", "#41a9c9"], strokes: ["#aa4520", "#2d768d"] },
  },
  title: {
    text: "Microsoft Internet Explorer vs Google Chrome",
  },
  subtitle: {
    text: "2009-2019",
  },
  data: getData(),
  series: [
    {
      type: "area",
      xKey: "year",
      yKey: "ie",
      yName: "IE",
      fillOpacity: 0.7,
      marker: {
        enabled: true,
      },
    },
    {
      type: "area",
      xKey: "year",
      yKey: "chrome",
      yName: "Chrome",
      fillOpacity: 0.7,
      marker: {
        enabled: true,
      },
    },
  ],
  legend: {
    position: "top",
  },
}

AgChart.create(options)
