import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  autoSize: true,
  title: {
    text: 'Mean Sea Level (mm)',
  },
  container: document.getElementById('myChart'),
  data: getData(),
  series: [
    {
      type: 'scatter',
      xKey: 'time',
      yKey: 'mm',
      showInLegend: false,
    },
  ],
}

agCharts.AgChart.create(options)
