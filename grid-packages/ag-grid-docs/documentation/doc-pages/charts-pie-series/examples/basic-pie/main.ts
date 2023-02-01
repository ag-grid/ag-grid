import { AgChartOptions, AgChart } from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  data: [
    { value: 56.9 },
    { value: 22.5 },
    { value: 6.8 },
    { value: 8.5 },
    { value: 2.6 },
    { value: 1.9 },
  ],
  series: [
    {
      type: 'pie',
      angleKey: 'value',
    },
  ],
}

AgChart.create(options)
