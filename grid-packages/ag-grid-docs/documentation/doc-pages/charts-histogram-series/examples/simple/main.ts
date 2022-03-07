import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Race demographics',
  },
  data: getData(),
  series: [
    {
      type: 'histogram',
      xKey: 'age',
      xName: 'Participant Age',
    },
  ],
  legend: {
    enabled: false,
  },
  axes: [
    {
      type: 'number',
      position: 'bottom',
      title: { text: 'Age band (years)' },
    },
    {
      type: 'number',
      position: 'left',
      title: { text: 'Number of participants' },
    },
  ],
}

agCharts.AgChart.create(options)
