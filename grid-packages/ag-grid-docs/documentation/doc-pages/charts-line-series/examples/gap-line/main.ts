import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

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

AgChart.create(options)
