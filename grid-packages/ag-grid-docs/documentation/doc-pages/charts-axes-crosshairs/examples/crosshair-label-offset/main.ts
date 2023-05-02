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
    },
  },
  padding: {
    left: 45,
    bottom: 45
  },
  series: [
    {
      type: 'scatter',
      sizeKey: 'planetRadius',
      yKey: 'equilibriumTemp',
      xKey: 'planetRadius',
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Equilibrium Temperature [K]',
      },
      crosshair: {
        enabled: true,
        label: {
          xOffset: -55,
        }
      },
    },
    {
      type: 'number',
      position: 'bottom',
      title: {
        text: 'Planet Radius [Earth Radius]',
      },
      crosshair: {
        enabled: true,
        label: {
          yOffset: 40,
        }
      },
    },
  ],
};

AgEnterpriseCharts.create(options);