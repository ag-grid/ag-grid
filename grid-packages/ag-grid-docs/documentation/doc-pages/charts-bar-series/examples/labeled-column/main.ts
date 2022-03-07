import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const formatter = ({ value }: { value?: number }) => value == null ? '' : value.toFixed(0);

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
      stacked: true,
      label: { formatter },
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'mac',
      yName: 'Mac',
      stacked: true,
      label: { formatter },
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'ipad',
      yName: 'iPad',
      stacked: true,
      label: { formatter },
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'wearables',
      yName: 'Wearables',
      stacked: true,
      label: { formatter },
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'services',
      yName: 'Services',
      stacked: true,
      label: { formatter },
    },
  ],
}

agCharts.AgChart.create(options)
