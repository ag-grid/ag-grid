import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Microsoft Internet Explorer vs Google Chrome',
  },
  subtitle: {
    text: '2009-2019',
  },
  data: getData(),
  series: [
    {
      type: 'area',
      xKey: 'year',
      yKeys: ['ie'],
      yNames: ['IE'],
      fills: ['#f44336'],
      strokes: ['#ab2f26'],
      fillOpacity: 0.7,
      marker: {
        enabled: true,
      },
    },
    {
      type: 'area',
      xKey: 'year',
      yKeys: ['chrome'],
      yNames: ['Chrome'],
      fills: ['#8bc34a'],
      strokes: ['#618834'],
      fillOpacity: 0.7,
      marker: {
        enabled: true,
      },
    },
  ],
  legend: {
    position: 'top',
  },
}

agCharts.AgChart.create(options)
