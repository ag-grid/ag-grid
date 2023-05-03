import { AgEnterpriseCharts, AgCartesianChartOptions, AgCrosshairLabelRendererParams } from 'ag-charts-enterprise';
import { getData } from './data';

const corsshairLabelRenderer = ({ value }: AgCrosshairLabelRendererParams) => {
  return {
    text: `${(value / 1000000).toFixed(1)}M`,
    color: 'aliceBlue',
    backgroundColor: 'darkBlue',
    opacity: 0.8,
  };
};

const options : AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  series: [
    {
      type: 'histogram',
      yKey: 'bicycleHires',
      xKey: 'day',
      highlightStyle: {
        item: {
          fill: 'darkBlue'
        }
      },
      fill: '#5470C6',
      strokeWidth: 0,
      shadow: {
        color: 'aliceBlue'
      }
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'right',
      title: {
        text: 'Number of Bicycle Hires',
      },
      label: {
        formatter: (params) => `${params.value / 1000000}M`,
      },
      crosshair: {
        label: {
          xOffset: 60,
          renderer: corsshairLabelRenderer,
        },
      },
    },
    {
      type: 'time',
      position: 'bottom',
      crosshair: {
        label : {
          format: `%b %d`
        }
      },
    },
  ],
};

AgEnterpriseCharts.create(options);