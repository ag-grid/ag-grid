import { AgChart, AgChartOptions, time } from 'ag-charts-community';

var lastTime = new Date('07 Jan 2020 13:25:00 GMT').getTime()
var data: { time: Date, voltage: number }[] = []

function getData() {
  data.shift()

  while (data.length < 20) {
    data.push({
      time: new Date((lastTime += 1000)),
      voltage: 1.1 + Math.random() / 2,
    })
  }

  return data
}

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  series: [
    {
      xKey: 'time',
      yKey: 'voltage',
    },
  ],
  axes: [
    {
      type: 'time',
      position: 'bottom',
      nice: false,
      tick: {
        count: time.second.every(5),
      },
      label: {
        format: '%H:%M:%S',
      },
    },
    {
      type: 'number',
      position: 'left',
      label: {
        format: '#{.2f}V',
      },
    },
  ],
  title: {
    text: 'Core Voltage',
  },
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
var updating = false

function startUpdates() {
  if (updating) {
    return
  }

  updating = true
  update()
  setInterval(update, 500)
}

function update() {
  options.data = getData()
  AgChart.update(chart, options)
}


if (typeof window !== 'undefined') {
  // Attach external event handlers to window so they can be called from index.html
  (<any>window).startUpdates = startUpdates;
}