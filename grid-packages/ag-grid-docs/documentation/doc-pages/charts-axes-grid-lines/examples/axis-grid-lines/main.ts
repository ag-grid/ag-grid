import { AgCartesianChartOptions, AgChart } from 'ag-charts-community'

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: "Most Common Girls' First Names In English",
  },
  subtitle: {
    text: 'over the past 100 years',
  },
  data: [
    { name: 'Mary', count: 234000 },
    { name: 'Patricia', count: 211000 },
    { name: 'Jennifer', count: 178000 },
    { name: 'Elizabeth', count: 153000 },
    { name: 'Linda', count: 123000 },
  ],
  series: [
    {
      type: 'line',
      xKey: 'name',
      yKey: 'count',
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'number',
      position: 'left',
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)

function useGridStyle1() {
  var gridStyle = [
    {
      stroke: 'gray',
      lineDash: [10, 5],
    },
    {
      stroke: 'lightgray',
      lineDash: [5, 5],
    },
  ]
  options.axes![0].gridStyle = gridStyle
  options.axes![1].gridStyle = gridStyle
  AgChart.update(chart, options)
}

function useGridStyle2() {
  var xGridStyle = [
    {
      stroke: 'red',
      lineDash: [3, 3],
    },
  ]
  var yGridStyle = [
    {
      stroke: 'green',
      lineDash: [8, 3, 3, 3],
    },
  ]
  options.axes![0].gridStyle = xGridStyle
  options.axes![1].gridStyle = yGridStyle
  AgChart.update(chart, options)
}

function useDefaultGridStyle() {
  var gridStyle = [
    {
      stroke: 'rgba(219, 219, 219, 1)',
      lineDash: [4, 2],
    },
  ]
  options.axes![0].gridStyle = gridStyle
  options.axes![1].gridStyle = gridStyle
  AgChart.update(chart, options)
}
