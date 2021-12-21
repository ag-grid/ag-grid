import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Gross Weekly Earnings by Occupation (Q4 2019)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Office for National Statistics',
  },
  series: [
    {
      type: 'bar',
      xKey: 'type',
      yKeys: ['earnings'],
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'left',
    },
    {
      type: 'number',
      position: 'bottom',
      title: {
        text: '£/week',
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)
