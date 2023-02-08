import { AgCartesianChartOptions, AgChart, AgNumberAxisThemeOptions } from 'ag-charts-community'

const options: AgCartesianChartOptions & { axes: AgNumberAxisThemeOptions[] } = {
  container: document.getElementById('myChart'),
  data: generateSpiralData(),
  series: [
    {
      type: 'line',
      xKey: 'x',
      yKey: 'y',
      marker: {
        enabled: false,
      },
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'bottom',
      tick: {
      },
    },
    {
      type: 'number',
      position: 'left',
      tick: {
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)

function setTickCountTo5() {
  options.axes![0].tick!.count = 5
  options.axes![1].tick!.count = 5
  AgChart.update(chart, options)
}

function setTickCountTo10() {
  options.axes![0].tick!.count = 10
  options.axes![1].tick!.count = 10
  AgChart.update(chart, options)
}

function generateSpiralData() {
  var a = 1
  var b = 1
  var data = []
  var step = 0.1
  for (var th = 1; th < 50; th += step) {
    var r = a + b * th
    var datum = {
      x: r * Math.cos(th),
      y: r * Math.sin(th),
    }
    data.push(datum)
  }
  return data
}
