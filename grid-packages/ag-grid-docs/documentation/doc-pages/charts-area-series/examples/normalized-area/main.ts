import { Grid, AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Browser Wars',
  },
  subtitle: {
    text: '2009-2019',
  },
  data: getData(),
  series: [
    {
      type: 'area',
      xKey: 'year',
      yKeys: ['ie', 'firefox', 'safari', 'chrome'],
      yNames: ['IE', 'Firefox', 'Safari', 'Chrome'],
      normalizedTo: 100,
      marker: {
        enabled: true,
      },
    },
  ],
}

agCharts.AgChart.create(options)
