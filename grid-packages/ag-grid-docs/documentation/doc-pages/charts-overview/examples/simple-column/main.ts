import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

function formatNumber(value: number) {
  value /= 1000_000;
  return `${Math.floor(value)}M`;
}

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Total Visitors to Museums and Galleries',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Department for Digital, Culture, Media & Sport',
  },
  series: [
    {
      type: 'column',
      xKey: 'year',
      yKey: 'visitors',
      fill: '#0084e7',
      strokeWidth: 0,
      shadow: {
        xOffset: 3,
      },
      label: {
        enabled: true,
        color: '#eeeeee',
        formatter: ({ value }) => formatNumber(value),
      },
      tooltip: {
        renderer: ({ yValue, xValue }) => {
          return { title: xValue, content: formatNumber(yValue) };
        },
      },
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
      title: {
        text: 'Year',
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Total visitors',
      },
      label: {
        formatter: ({ value }) => formatNumber(value),
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = agCharts.AgChart.create(options)
