import { AgCartesianChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

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
      },
      tick: {
        count: 10,
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)





