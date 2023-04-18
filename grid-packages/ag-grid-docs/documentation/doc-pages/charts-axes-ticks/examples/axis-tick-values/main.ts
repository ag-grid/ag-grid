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
        values: [0, 20, 40, 60, 80, 100]
      }
    },
  ],
  legend: {
    enabled: false,
  },
}

const chart = AgChart.create(options)

function setTickValues(values: number[]) {
  options.axes![1].tick = { values };
  AgChart.update(chart, options);
}

function reset() {
  options.axes![1].tick = {};
  AgChart.update(chart, options);
}