import { AgCartesianChartOptions, AgChart } from 'ag-charts-community'

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  data: [
    { os: 'A', share: 10 },
    { os: 'B', share: 100 },
    { os: 'C', share: 1000 },
  ],
  series: [
    {
      type: 'line',
      xKey: 'os',
      yKey: 'share',
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
      label: {
        format: '.0f',
      }
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)

function useNumberAxis() {
  options.axes = [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'number',
      position: 'left',
      min: 1,
      label: {
        format: '.0f',
      }
    },
  ]
  AgChart.update(chart, options)
}

function useLogAxis() {
  options.axes = [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'log',
      position: 'left',
      min: 10,
      label: {
        format: '.0f',
      }
    },
  ]
  AgChart.update(chart, options)
}

function useBaseTwoLogAxis() {
  options.axes = [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'log',
      position: 'left',
      min: 10,
      label: {
        format: '.0f',
      },
      base: 2,
    },
  ]
  AgChart.update(chart, options)
}

function useLogAxisWithFewerTicks() {
  options.axes = [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'log',
      position: 'left',
      min: 10,
      label: {
        format: '.0f',
      },
      tick: {
        minSpacing: 200,
      },
    },
  ]
  AgChart.update(chart, options)
}
