import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Internet Explorer Market Share',
  },
  subtitle: {
    text: '2009-2019 (aka "good times")',
  },
  data: getData(),
  series: [
    {
      type: 'area',
      xKey: 'year',
      yKey: 'ie',
      yName: 'IE',
      marker: {
        enabled: true,
      },
      tooltip: {
        renderer: (params) => {
          return {
            content: `${params.xValue}: ${params.yValue.toFixed(1)}%`,
          }
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

AgChart.create(options)
