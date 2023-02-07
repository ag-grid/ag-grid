import { AgChart, AgChartOptions } from "ag-charts-community";
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ["#5BC0EB", "#FDE74C", "#9BC53D", "#E55934", "#FA7921", "#fa3081"],
      strokes: [
        "#4086a4",
        "#b1a235",
        "#6c8a2b",
        "#a03e24",
        "#af5517",
        "#af225a",
      ],
    },
    overrides: {
      area: {
        series: {
          marker: { enabled: true },
          highlightStyle: {
            series: {
              dimOpacity: 0.2
            }
          },
          tooltip: {
            renderer: ({ xValue, yValue }) => {
              const date = Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(xValue);
              return { content: `${date}: ${(Math.round(yValue / 100) / 10) + 'k'}` };
            },
          },
        }
      }
    },
  },
  title: {
    text: "Total Visitors to Science Museums (2019)",
    fontSize: 18,
  },
  subtitle: {
    text: "Source: Department for Digital, Culture, Media & Sport",
  },
  series: [
    { type: "area", xKey: "date", stacked: true, yKey: "Science Museum", yName: "Science Museum" },
    {
      type: "area",
      xKey: "date",
      stacked: true,
      yKey: "National Media Museum",
      yName: "National Media Museum",
    },
    {
      type: "area",
      xKey: "date",
      stacked: true,
      yKey: "National Railway Museum",
      yName: "National Railway Museum",
    },
    { type: "area", xKey: "date", stacked: true, yKey: "Locomotion", yName: "Locomotion" },
    {
      type: "area",
      xKey: "date",
      yKey: "Museum of Science and Industry, Manchester",
      yName: "Museum of Science and Industry, Manchester",
      stacked: true,
    },
    {
      type: "area",
      xKey: "date",
      yKey: "National Coal Mining Museum for England",
      yName: "National Coal Mining Museum for England",
      stacked: true,
    },
  ],
  axes: [
    {
      type: "time",
      position: "bottom",
      label: {
        format: "%b",
      },
      tick: {
        count: 10,
      },
    },
    {
      type: "number",
      position: "left",
      title: {
        text: "Total visitors",
      },
      label: {
        formatter: (params) => {
          return params.value / 1000 + "k"
        },
      },
    },
  ],
  legend: {
    position: "bottom",
  },
}

var chart = AgChart.create(options)
