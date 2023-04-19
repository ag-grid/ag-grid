import { AgCartesianChartOptions, AgChart } from "ag-charts-community"
import { getData } from "./data"

const formatter = new Intl.NumberFormat()

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  data: getData(),
  title: {
    text: "World Population Over Time",
  },
  subtitle: {
    text: "log scale",
  },
  series: [
    {
      type: "line",
      xKey: "year",
      yKey: "population",
      tooltip: {
        renderer: params => {
          return {
            content: `${params.xValue} CE: ${formatter.format(
              params.yValue ?? 0
            )}`,
          }
        },
      },
    },
  ],
  axes: [
    {
      type: "log",
      position: "left",
      title: {
        text: "Population",
      },
      label: {
        format: ",.0f",
        fontSize: 10,
      },
    },
    {
      type: "number",
      position: "bottom",
      title: {
        text: "Year",
      },
      label: {
        fontSize: 10,
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)

function useNumberAxis() {
  options.subtitle = {
    text: "linear scale",
  }
  options.axes![0] = {
    type: "number",
    position: "left",
    title: {
      text: "Population",
    },
    label: {
      format: ",.0f",
      fontSize: 10,
    },
  }
  AgChart.update(chart, options)
}

function useLogAxis() {
  options.subtitle = {
    text: "log scale",
  }
  options.axes![0] = {
    type: "log",
    position: "left",
    title: {
      text: "Population",
    },
    label: {
      format: ",.0f",
      fontSize: 10,
    },
  }
  AgChart.update(chart, options)
}
