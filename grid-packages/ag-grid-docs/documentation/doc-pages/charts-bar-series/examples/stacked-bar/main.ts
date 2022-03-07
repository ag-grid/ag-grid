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
      type: 'bar',
      xKey: 'quarter',
      yKey: 'iphone',
      yName: 'iPhone',
      stacked: true,
    },
    {
      type: 'bar',
      xKey: 'quarter',
      yKey: 'mac',
      yName: 'Mac',
      stacked: true,
    },
    {
      type: 'bar',
      xKey: 'quarter',
      yKey: 'ipad',
      yName: 'iPad',
      stacked: true,
    },
    {
      type: 'bar',
      xKey: 'quarter',
      yKey: 'wearables',
      yName: 'Wearables',
      stacked: true,
    },
    {
      type: 'bar',
      xKey: 'quarter',
      yKey: 'services',
      yName: 'Services',
      stacked: true,
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'bottom',
    },
    {
      type: 'category',
      position: 'left',
    },
  ],
}

agCharts.AgChart.create(options)
