import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Fuel Spending (2019)',
  },
  data: [
    {
      quarter: 'Q1',
      petrol: 200,
      electric: 50,
    },
    {
      quarter: 'Q2',
      petrol: 300,
      electric: 60,
    },
    {
      quarter: 'Q3',
      petrol: 350,
      electric: 70,
    },
    {
      quarter: 'Q4',
      petrol: 400,
      electric: 50,
    },
  ],
  series: [
    {
      type: 'area',
      xKey: 'quarter',
      yKeys: ['petrol', 'electric'],
      yNames: ['Petrol', 'Electric'],
      marker: {
        formatter: function (params) {
          return {
            size: params.yKey === 'electric' ? 12 : params.size,
          }
        },
      },
    },
  ],
}

agCharts.AgChart.create(options)
