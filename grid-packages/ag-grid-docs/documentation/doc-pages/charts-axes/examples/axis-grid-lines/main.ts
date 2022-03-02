import { AgCartesianChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: "Most Common Girls' First Names In English",
  },
  subtitle: {
    text: 'over the past 100 years',
  },
  data: [
    { name: 'Mary', count: 234000 },
    { name: 'Patricia', count: 211000 },
    { name: 'Jennifer', count: 178000 },
    { name: 'Elizabeth', count: 153000 },
    { name: 'Linda', count: 123000 },
  ],
  series: [
    {
      type: 'line',
      xKey: 'name',
      yKey: 'count',
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'number',
      position: 'left',
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)




