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
          let yValue = params.yValue
          if (yValue == null) yValue = 0
          return {
            content: `${params.xValue} CE: ${formatter.format(yValue)}`,
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
