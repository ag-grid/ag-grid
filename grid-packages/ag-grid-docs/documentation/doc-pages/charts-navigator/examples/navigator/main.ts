import { AgCartesianChartOptions, AgChart } from 'ag-charts-community'
import { getData } from './data';

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: "Try dragging the Navigator's handles to zoom in",
  },
  subtitle: {
    text: 'or the area between them to pan around',
  },
  data: getData(),
  series: [
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate Modern',
      fill: '#c16068',
      stroke: '#874349',
    },
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate Britain',
      fill: '#a2bf8a',
      stroke: '#718661',
    },
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate Liverpool',
      fill: '#ebcc87',
      stroke: '#a48f5f',
    },
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate St Ives',
      fill: '#80a0c3',
      stroke: '#5a7088',
    },
  ],
  axes: [
    {
      type: 'time',
      position: 'bottom',
    },
    {
      type: 'number',
      position: 'left',
      label: {
        formatter: (params) => {
          return params.value / 1000 + 'k'
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
  navigator: {
    enabled: true,
  },
}

var chart = AgChart.create(options)

function toggleEnabled(value: boolean) {
  options.navigator!.enabled = value
  AgChart.update(chart, options)
}
