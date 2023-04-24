import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Punch Card of Github',
    fontSize: 18,
  },
  subtitle: {
    text: 'time distribution of commits',
  },
  series: [
    {
      type: 'scatter',
      xKey: 'hour',
      xName: 'Time',
      yKey: 'day',
      yName: 'Day',
      sizeKey: 'size',
      sizeName: 'Commits',
      title: 'Punch Card',
      marker: {
        size: 0,
        maxSize: 30,
        fill: '#cc5b58',
        fillOpacity: 0.85,
        strokeOpacity: 0.85,
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'category',
      gridStyle: [
        {
          stroke: 'rgba(0,0,0,0.2)',
          lineDash: [0, 5, 0],
        },
      ],
      paddingInner: 0.2,
      paddingOuter: 0.3,
      tick: {
        color: 'black',
      },
      line: {
        color: undefined,
      },
    },
    {
      position: 'left',
      type: 'category',
      gridStyle: [],
      paddingInner: 0.2,
      paddingOuter: 0.3,
      tick: {
        color: 'black',
      },
      line: {
        color: undefined,
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
