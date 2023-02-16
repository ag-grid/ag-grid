import { AgChart, AgChartOptions, time } from 'ag-charts-community';
import { getData } from './data';

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      line: {
        axes: {
          number: {
            gridStyle: [],
          },
          time: {
            gridStyle: [],
          }
        },
        series: {
          highlightStyle: {
            series: {
              strokeWidth: 3,
              dimOpacity: 0.2,
            },
          },
        },
      },
    },
  },
  series: [
    {
      type: 'line',
      xKey: 'date',
      yKey: 'petrol',
      stroke: '#01c185',
      marker: {
        stroke: '#01c185',
        fill: '#01c185',
      },
    },
    {
      type: 'line',
      xKey: 'date',
      yKey: 'diesel',
      stroke: '#000000',
      marker: {
        stroke: '#000000',
        fill: '#000000',
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'time',
      label: {
        autoRotate: true,
      },
      tick: {
        interval: time.month.every(2),
      },
      title: {
        text: 'Date',
      },
      crossLines: [
        {
          type: 'range',
          range: [new Date(2019, 4, 1), new Date(2019, 6, 1)],
          strokeWidth: 0,
          fill: '#7290C4',
          fillOpacity: 0.4,
          label: {
            text: 'Price Peak',
            position: 'top',
            fontSize: 14,
          },
        },
      ],
    },
    {
      position: 'left',
      type: 'number',
      title: {
        text: 'Price in pence',
      },
      crossLines: [
        {
          type: 'line',
          value: 142.45,
          stroke: '#7290C4',
          lineDash: [6, 12],
          label: {
            text: '142.4',
            position: 'right',
            fontSize: 12,
            color: '#000000',
          },
        },
        {
          type: 'line',
          value: 133.80,
          stroke: '#7290C4',
          lineDash: [6, 12],
          label: {
            text: '133.8',
            position: 'right',
            fontSize: 12,
            color: '#01c185',
          },
        },
        {
          type: 'line',
          value: 135.35,
          stroke: '#D21E75',
          lineDash: [2, 4],
          label: {
            text: '135.3',
            position: 'right',
            fontSize: 12,
            color: '#000000',
          },
        },
        {
          type: 'line',
          value: 123.97,
          stroke: '#D21E75',
          lineDash: [2, 4],
          label: {
            text: '124.0',
            position: 'right',
            fontSize: 12,
            color: '#01c185',
          },
        },
      ],
    },
  ],
};

var chart = AgChart.create(options);
