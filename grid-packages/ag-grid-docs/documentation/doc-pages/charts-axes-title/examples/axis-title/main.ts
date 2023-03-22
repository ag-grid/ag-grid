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
        text: 'Desktop Operating Systems',
        enabled: false,
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Market Share (%)',
        enabled: false,
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)

function showAxisTitles() {
  options.axes![0].title!.enabled = true
  options.axes![1].title!.enabled = true
  AgChart.update(chart, options)
}

function hideAxisTitles() {
  options.axes![0].title!.enabled = false
  options.axes![1].title!.enabled = false
  AgChart.update(chart, options)
}
