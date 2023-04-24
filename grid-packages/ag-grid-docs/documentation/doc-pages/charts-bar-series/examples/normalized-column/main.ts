import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

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
      normalizedTo: 100,
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'mac',
      yName: 'Mac',
      normalizedTo: 100,
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'ipad',
      yName: 'iPad',
      normalizedTo: 100,
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'wearables',
      yName: 'Wearables',
      normalizedTo: 100,
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'quarter',
      yKey: 'services',
      yName: 'Services',
      normalizedTo: 100,
      stacked: true,
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      label: {
        formatter: (params) => Math.round(params.value) + '%',
      },
    },
    {
      type: 'category',
      position: 'bottom',
    },
  ],
}

AgChart.create(options)
