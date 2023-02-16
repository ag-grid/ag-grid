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

function resetTickConfig() {
  options.axes![0].tick = {}
  options.axes![1].tick = {}
  AgChart.update(chart, options)
}

function setTickMinMaxSpacing() {
  options.axes![0].tick = {
    minSpacing: 300,
    maxSpacing: 500,
  }
  options.axes![1].tick = {
    minSpacing: 100,
    maxSpacing: 200,
  }
  AgChart.update(chart, options)
}

function setTickInterval() {
  options.axes![0].tick = {
    interval: 30,
  }
  options.axes![1].tick = {
    interval: 30,
  }
  AgChart.update(chart, options)
}

function setTickValues() {
  options.axes![0].tick = {
    values: [-50, -43 -21, -6, 21, 43, 50],
  }
  options.axes![1].tick = {
    values: [-50, -43 -21, -6, 21, 43, 50],
  }
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
