import { AgCartesianChartOptions, AgChart } from 'ag-charts-community'

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  data: [
    { os: 'Windows', share: 88.07 },
    { os: 'macOS', share: 9.44 },
    { os: 'Linux', share: 1.87 },
  ],
  series: [
    {
      type: 'column',
      xKey: 'os',
      yKey: 'share',
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
      title: {
        text: 'Operating System',
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Market Share (%)',
      },
      tick: {
        interval: 20,
      }
    },
  ],
  legend: {
    enabled: false,
  },
}

const chart = AgChart.create(options)

function setTickInterval(interval: number) {
  options.axes![1].tick = { interval }
  AgChart.update(chart, options);
}

function resetInterval() {
  options.axes![1].tick = {};
  AgChart.update(chart, options);
}