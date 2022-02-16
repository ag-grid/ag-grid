import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Total Visitors to Museums and Galleries',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Department for Digital, Culture, Media & Sport',
  },
  series: [
    {
      type: 'column',
      xKey: 'year',
      yKey: 'visitors',
      fills: ['#0084e7'],
      strokes: ['#00407f'],
      shadow: {
        enabled: true,
        xOffset: 3,
      },
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
      title: {
        enabled: true,
        text: 'Year',
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        enabled: true,
        text: 'Total visitors',
      },
      label: {
        formatter: function (params) {
          return params.value / 1000000 + 'M'
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)
