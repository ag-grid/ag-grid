import { Grid, AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: "Apple's revenue by product category",
  },
  subtitle: {
    text: 'in billion U.S. dollars',
  },
  data: getData(),
  series: [
    {
      type: 'column',
      xKey: 'quarter',
      yKeys: ['iphone', 'mac', 'ipad', 'wearables', 'services'],
      yNames: ['iPhone', 'Mac', 'iPad', 'Wearables', 'Services'],
      normalizedTo: 100,
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      label: {
        formatter: function (params) {
          return Math.round(params.value) + '%'
        },
      },
    },
    {
      type: 'category',
      position: 'bottom',
    },
  ],
}

agCharts.AgChart.create(options)
