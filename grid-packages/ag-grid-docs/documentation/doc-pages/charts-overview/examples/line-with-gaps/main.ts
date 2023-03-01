import { AgChart, AgChartOptions } from "ag-charts-community";
import { getData } from "./data";

const year = new Date().getFullYear();
const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: [
        "#0b1791",
        "#be2a2c",
        "#f6d24a",
        "#ce1126",
        "#002d62",
        "#1b4e9e",
        "#f6d24a",
        "#0073cf",
        "#e88532",
        "#000000",
        "#006847",
        "#c22b38",
        "#042279",
        "#4997d0",
        "#2868c1",
        "#459945",
      ],
      strokes: [
        "#0b1791",
        "#f6d24a",
        "#f6d24a",
        "#ce1126",
        "#ce1126",
        "#fade4b",
        "#be2a2c",
        "#0073cf",
        "#469c65",
        "#fed100",
        "#ce1126",
        "#1e5190",
        "#bf2b30",
        "#4997d0",
        "#2868c1",
        "#459945",
      ],
    },
    overrides: {
      cartesian: {
        series: {
          line: {
            highlightStyle: {
              series: {
                dimOpacity: 0.2,
                strokeWidth: 4,
              },
            },
            marker: { enabled: true },
          },
        },
      },
    },
  },
  title: {
    text: `Imported Banana Prices (${year - 1})`,
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Department for Environment, Food and Rural Affairs",
  },
  series: [
    {
      type: "line",
      xKey: "week",
      yKey: "belize",
      yName: "Belize",
    },
    {
      type: "line",
      xKey: "week",
      yKey: "cameroon",
      yName: "Cameroon",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "columbia",
      yName: "Columbia",
    },
    {
      type: "line",
      xKey: "week",
      yKey: "costaRica",
      yName: "Costa Rica",
    },
    {
      type: "line",
      xKey: "week",
      yKey: "dominicanRepublic",
      yName: "Dominican Republic",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "ecuador",
      yName: "Ecuador",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "ghana",
      yName: "Ghana",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "honduras",
      yName: "Honduras",
    },
    {
      type: "line",
      xKey: "week",
      yKey: "ivoryCoast",
      yName: "Ivory Coast",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "jamaica",
      yName: "Jamaica",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "mexico",
      yName: "Mexico",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "panama",
      yName: "Panama",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "windwardIsles",
      yName: "Windward Isles",
      marker: {
        strokeWidth: 2,
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "guatemala",
      yName: "Guatemala",
    },
    {
      type: "line",
      xKey: "week",
      yKey: "nicaragua",
      yName: "Nicaragua",
      marker: {
        fill: "#ffffff",
      },
    },
    {
      type: "line",
      xKey: "week",
      yKey: "brazil",
      yName: "Brazil",
    },
  ],
  axes: [
    {
      type: "category",
      position: "bottom",
      title: {
        text: "Week",
      },
      label: {
        formatter: params => (params.index % 3 ? "" : params.value),
      },
    },
    {
      type: "number",
      position: "left",
      title: {
        text: "£ per kg",
      },
      nice: false,
      min: 0.2,
      max: 1,
    },
  ],
  legend: {
    position: "bottom",
    item: {
      paddingY: 15,
    },
    spacing: 30,
  },
}

var chart = AgChart.create(options)
