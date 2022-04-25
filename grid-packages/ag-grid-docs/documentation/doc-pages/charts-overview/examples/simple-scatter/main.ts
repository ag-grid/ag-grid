import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Height vs Weight for Major League Baseball Players',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Statistics Online Computational Resource',
  },
  series: [
    {
      type: 'scatter',
      xKey: 'weight',
      yKey: 'height',
      fillOpacity: 0.5,
      strokeOpacity: 0,
      marker: {
        size: 12,
        fill: '#002D72',
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'number',
      title: {
        text: 'Weight (pounds)',
      },
    },
    {
      position: 'left',
      type: 'number',
      title: {
        text: 'Height (inches)',
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)
