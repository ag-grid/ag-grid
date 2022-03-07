import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'People Born',
  },
  subtitle: {
    text: '2008-2020',
  },
  series: [
    {
      xKey: 'year',
      yKey: 'visitors',
    },
  ],
  legend: {
    enabled: false,
  },
}

agCharts.AgChart.create(options)
