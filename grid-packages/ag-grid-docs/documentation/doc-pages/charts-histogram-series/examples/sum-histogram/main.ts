import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Prize money distribution',
  },
  subtitle: {
    text: 'Total winnings by participant age',
  },
  data: getData(),
  series: [
    {
      type: 'histogram',
      xKey: 'age',
      xName: 'Participant Age',
      yKey: 'winnings',
      yName: 'Winnings',
      aggregation: 'sum',
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
      tick: { interval: 2 },
    },
    {
      type: 'number',
      position: 'left',
      title: { text: 'Total winnings (USD)' },
    },
  ],
}

AgChart.create(options)
