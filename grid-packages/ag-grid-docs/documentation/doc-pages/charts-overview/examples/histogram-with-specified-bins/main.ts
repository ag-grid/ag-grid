import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Vehicle weight distribution',
    fontSize: 18,
  },
  subtitle: {
    text: 'USA 1987'
  },
  footnote: {
    text: 'Source: UCI',
  },
  series: [
    {
      type: 'histogram',
      xKey: 'curb-weight',
      xName: 'Curb weight',
      fillOpacity: 0.5,
      fill: '#8888ff',
      stroke: '#000',
      bins: [
        [0, 2000],
        [2000, 3000],
        [3000, 4500],
      ],
      areaPlot: true,
      tooltip: {
        renderer: (params) => {
          var paramsMax = params.datum.domain[1]
          var sizeName =
            paramsMax === 2000
              ? 'small'
              : paramsMax === 3000
                ? 'medium'
                : 'large'

          return {
            content:
              '<b>' +
              params.datum.frequency +
              '</b> vehicles in the <b>' +
              sizeName +
              '</b> category by <b>' +
              params.xName!.toLowerCase() +
              '</b>',
          }
        },
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'number',
      title: {
        text: 'Curb weight (pounds)',
      },
    },
    {
      position: 'left',
      type: 'number',
      label: {
        formatter: () => {
          return ''
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
