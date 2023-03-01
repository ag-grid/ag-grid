import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const year = new Date().getFullYear();
const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: `Change in Number of Jobs in UK\n(June to September ${year - 1})`,
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Office for National Statistics',
  },
  series: [
    {
      type: 'bar',
      xKey: 'job',
      yKey: 'change',
      fill: 'rgba(0, 117, 163, 0.9)',
      stroke: 'rgba(0, 117, 163, 0.9)',
      highlightStyle: {
        item: {
          fill: '#0ab9ff',
        },
      },
      label: {
        fontWeight: 'bold',
        color: 'white',
        formatter: (params) => {
          return (params.value > 0 ? '+' : '') + params.value
        },
      },
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
        enabled: true,
        text: 'Change in number of jobs (thousands)',
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
