import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      area: {
        series: {
          fillOpacity: 0.8,
          tooltip: {
            renderer: ({ xValue, yValue }) => {
              const date = Intl.DateTimeFormat('en-GB').format(xValue);
              return { content: `${date}: ${(Math.round(yValue / 100) / 10) + 'k'}` };
            },
          },
        }
      }
    },
  },
  title: {
    text: 'Total Visitors to Tate Galleries',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Department for Digital, Culture, Media & Sport',
  },
  series: [
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate Modern',
      fill: '#c16068',
      stroke: '#874349',
      yName: 'Tate Modern',
    },
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate Britain',
      fill: '#a2bf8a',
      stroke: '#718661',
      yName: 'Tate Britain',
    },
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate Liverpool',
      fill: '#ebcc87',
      stroke: '#a48f5f',
      yName: 'Tate Liverpool',
    },
    {
      type: 'area',
      xKey: 'date',
      yKey: 'Tate St Ives',
      fill: '#80a0c3',
      stroke: '#5a7088',
      yName: 'Tate St Ives',
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
      title: {
        text: 'Total visitors',
      },
      label: {
        formatter: (params) => {
          return params.value / 1000 + 'k'
        },
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
}

var chart = AgChart.create(options)
