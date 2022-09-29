import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from './data';

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  padding: {
    right: 30,
    bottom: 50,
    left: 30,
  },
  theme: {
    palette: {
      fills: ['#B7A8F5', '#6689C2', '#4BA88E', '#F5CD7F', '#F5667E'],
      strokes: ['#B7A8F5', '#6689C2', '#4BA88E', '#F5CD7F', '#F5667E'],
    },
    overrides: {
      cartesian: {
        axes: {
          number: {
            tick: {
              count: 5,
            },
            line: {
              width: 0,
            },
            gridStyle: [
              {
                stroke: 'rgb(219, 219, 219)',
                lineDash: [0],
              },
            ],
            label: {
              padding: 15,
              formatter: (p) => `${p.value}%`,
            },
          },
          time: {
            gridStyle: [
              {
                stroke: undefined,
              },
            ],
            tick: {
              count: agCharts.time.year
            },
            label: {
              format: '%b %Y',
            },
          },
        },
      },
      line: {
        series: {
          marker: {
            enabled: false,
          },
        },
      },
    },
  },
  title: {
    text: 'Annual Pay Growth & Inflation Rates',
  },
  subtitle: {
    text: '20012-2022',
  },
  series: [
    {
      type: 'column',
      xKey: 'date',
      yKey: 'totalPay',
      yName: 'Total Pay',
      stacked: true,
    },
    {
      type: 'column',
      xKey: 'date',
      yKey: 'regularPay',
      yName: 'Regular Pay',
      stacked: true,
    },
    {
      type: 'line',
      xKey: 'date',
      yKey: 'cpih',
      yName: 'CPIH',
      marker: {
        enabled: false,
      },
    },
    {
      type: 'line',
      xKey: 'date',
      yKey: 'cpi',
      yName: 'CPI',
      marker: {
        enabled: false,
      },
    },
    {
      type: 'line',
      xKey: 'date',
      yKey: 'ooh',
      yName: 'OOH',
      marker: {
        enabled: false,
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'time',
    },
    {
      position: 'right',
      type: 'number',
    },
  ],
  legend: {
    position: 'top',
  },
};

const chart = agCharts.AgChart.create(options);

function downloadChartDefault() {
  agCharts.AgChart.download(chart);
}

function downloadChartJPG(fileFormat: string) {
  agCharts.AgChart.download(chart, { fileFormat });
}

function downloadChartResized(width: number, height: number) {
  agCharts.AgChart.download(chart, { width, height });
}
