import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Engine size distribution (USA 1987)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: UCI',
  },
  series: [
    {
      type: 'histogram',
      xKey: 'engine-size',
      xName: 'Engine Size',
      fillOpacity: 0.5,
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'number',
      title: {
        text: 'Engine Size (Cubic inches)',
      },
      tick: {
        interval: 20,
      },
    },
    {
      position: 'left',
      type: 'number',
      title: {
        text: 'Frequency',
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
