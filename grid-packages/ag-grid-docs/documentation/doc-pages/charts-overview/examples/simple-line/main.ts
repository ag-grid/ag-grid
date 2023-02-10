import { AgChart, AgChartOptions, time } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      line: {
        series: {
          highlightStyle: {
            series: {
              strokeWidth: 3,
              dimOpacity: 0.2
            }
          }
        },
      },
    },
  },
  title: {
    text: 'Road fuel prices (2019)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Department for Business, Energy & Industrial Strategy',
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
      tick: {
        interval: time.month.every(2),
      },
      title: {
        text: 'Date',
      },
    },
    {
      position: 'left',
      type: 'number',
      title: {
        text: 'Price in pence',
      },
    },
  ],
}

var chart = AgChart.create(options)
