import { AgEnterpriseCharts, AgCartesianChartOptions } from 'ag-charts-enterprise';
import { getData } from './data';

const options : AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  theme: {
    palette: {
      fills: ['rgba(103,105,235,0.3)'],
      strokes: ['rgb(103,105,235)']
    }
  },
  series: [
    {
      type: 'scatter',
      sizeKey: 'planetRadius',
      yKey: 'eccentricity',
      xKey: 'distance',
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Eccentricity',
      },
      crosshair: {
        stroke: '#330066',
        strokeWidth: 2,
        lineDash: [5, 10],
      },
    },
    {
      type: 'number',
      position: 'bottom',
      title: {
        text: 'Distance [pc]',
      },
      crosshair: {
        stroke: '#330066',
        strokeWidth: 2,
        lineDash: [5, 10],
      },
    },
  ],
};

AgEnterpriseCharts.create(options);