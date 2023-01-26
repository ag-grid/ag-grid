import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

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

AgChart.create(options)
