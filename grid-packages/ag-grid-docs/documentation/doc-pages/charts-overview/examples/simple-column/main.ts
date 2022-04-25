import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Total Visitors to Museums and Galleries',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Department for Digital, Culture, Media & Sport',
  },
  series: [
    {
      type: 'column',
      xKey: 'year',
      yKey: 'visitors',
      fill: '#0084e7',
      strokeWidth: 0,
      shadow: {
        xOffset: 3,
      },
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
      title: {
        text: 'Year',
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Total visitors',
      },
      label: {
        formatter: (params) => {
          return params.value / 1000000 + 'M'
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)
