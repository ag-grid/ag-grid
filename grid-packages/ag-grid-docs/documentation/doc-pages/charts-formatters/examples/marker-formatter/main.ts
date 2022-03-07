import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

function formatter({ yKey, size }: { yKey: string, size: number }) {
  return { size: yKey === 'electric' ? 12 : size };
}

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Fuel Spending (2019)',
  },
  data: [
    {
      quarter: 'Q1',
      petrol: 200,
      electric: 50,
    },
    {
      quarter: 'Q2',
      petrol: 300,
      electric: 60,
    },
    {
      quarter: 'Q3',
      petrol: 350,
      electric: 70,
    },
    {
      quarter: 'Q4',
      petrol: 400,
      electric: 50,
    },
  ],
  series: [
    {
      type: 'area',
      xKey: 'quarter',
      yKey: 'petrol',
      marker: { formatter },
    },
    {
      type: 'area',
      xKey: 'quarter',
      yKey: 'electric',
      marker: { formatter },
    },
  ],
}

agCharts.AgChart.create(options)
