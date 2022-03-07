import { AgChartOptions } from 'ag-charts-community'
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
      yKey: 'iphone',
      yName: 'iPhone',
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'mac',
      yName: 'Mac',
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'ipad',
      yName: 'iPad',
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'wearables',
      yName: 'Wearables',
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'services',
      yName: 'Services',
    },
  ],
}

agCharts.AgChart.create(options)
