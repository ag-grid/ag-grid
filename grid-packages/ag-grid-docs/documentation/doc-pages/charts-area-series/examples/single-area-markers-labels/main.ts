import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

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
      label: {
        enabled: true,
        fontWeight: 'bold',
      },
      tooltip: {
        renderer: function (params) {
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

agCharts.AgChart.create(options)
