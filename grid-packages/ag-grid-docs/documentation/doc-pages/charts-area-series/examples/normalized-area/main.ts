import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Browser Wars',
  },
  subtitle: {
    text: '2009-2019',
  },
  data: browserData,
  series: [
    {
      type: 'area',
      xKey: 'year',
      yKeys: ['ie', 'firefox', 'safari', 'chrome'],
      yNames: ['IE', 'Firefox', 'Safari', 'Chrome'],
      normalizedTo: 1,
      marker: {
        enabled: true,
      },
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      label: {
        format: '.0%',
      },
    },
    {
      type: 'category',
      position: 'bottom',
    },
  ],
}

agCharts.AgChart.create(options)
