import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ['#00c851', '#ffbb33', '#ff4444'],
      strokes: ['#006428', '#996500', '#a10000'],
    },
  },
  title: {
    text: 'Internet Users by Geographical Location (2019)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Office for National Statistics',
  },
  series: [
    {
      type: 'bar',
      xKey: 'area',
      normalizedTo: 1,
      yKey: 'usedInLast3Months',
      yName: 'Used in last 3 months'
    },
    {
      type: 'bar',
      xKey: 'area',
      normalizedTo: 1,
      yKey: 'usedOver3MonthsAgo',
      yName: 'Used over 3 months ago'
    },
    {
      type: 'bar',
      xKey: 'area',
      normalizedTo: 1,
      yKey: 'neverUsed',
      yName: 'Never used'
    }
  ],
  axes: [
    {
      type: 'category',
      position: 'left',
      label: {
        rotation: -30,
      },
    },
    {
      type: 'number',
      position: 'bottom',
      label: {
        format: '.0%',
      },
    },
  ],
}

var chart = agCharts.AgChart.create(options)
