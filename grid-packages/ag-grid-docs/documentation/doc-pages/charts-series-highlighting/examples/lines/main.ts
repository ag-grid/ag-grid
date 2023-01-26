import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const options: AgChartOptions = {
  container: document.body,
  autoSize: true,
  data: getData(),
  theme: {
    overrides: {
      cartesian: {
        series: {
          line: {
            highlightStyle: {
              series: {
                dimOpacity: 0.2,
                strokeWidth: 4,
              },
            },
          },
        },
      },
    },
  },
  title: {
    text: 'Imported Banana Prices (2019)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Department for Environment, Food and Rural Affairs',
  },
  series: [
    {
      type: 'line',
      xKey: 'week',
      yKey: 'belize',
      yName: 'Belize',
      stroke: '#0b1791',
      marker: {
        fill: '#0b1791',
        stroke: '#0b1791',
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'cameroon',
      yName: 'Cameroon',
      stroke: '#be2a2c',
      marker: {
        fill: '#be2a2c',
        stroke: '#f6d24a',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'columbia',
      yName: 'Columbia',
      stroke: '#f6d24a',
      marker: {
        fill: '#f6d24a',
        stroke: '#f6d24a',
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'costaRica',
      yName: 'Costa Rica',
      stroke: '#ce1126',
      marker: {
        fill: '#ce1126',
        stroke: '#ce1126',
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'dominicanRepublic',
      yName: 'Dominican Republic',
      stroke: '#002d62',
      marker: {
        fill: '#002d62',
        stroke: '#ce1126',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'ecuador',
      yName: 'Ecuador',
      stroke: '#1b4e9e',
      marker: {
        fill: '#1b4e9e',
        stroke: '#fade4b',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'ghana',
      yName: 'Ghana',
      stroke: '#f6d24a',
      marker: {
        fill: '#f6d24a',
        stroke: '#be2a2c',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'honduras',
      yName: 'Honduras',
      stroke: '#0073cf',
      marker: {
        fill: '#0073cf',
        stroke: '#0073cf',
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'ivoryCoast',
      yName: 'Ivory Coast',
      stroke: '#e88532',
      marker: {
        fill: '#e88532',
        stroke: '#469c65',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'jamaica',
      yName: 'Jamaica',
      stroke: '#000000',
      marker: {
        fill: '#000000',
        stroke: '#fed100',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'mexico',
      yName: 'Mexico',
      stroke: '#006847',
      marker: {
        fill: '#006847',
        stroke: '#ce1126',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'panama',
      yName: 'Panama',
      stroke: '#c22b38',
      marker: {
        fill: '#c22b38',
        stroke: '#1e5190',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'windwardIsles',
      yName: 'Windward Isles',
      stroke: '#042279',
      marker: {
        fill: '#042279',
        stroke: '#bf2b30',
        strokeWidth: 2,
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'guatemala',
      yName: 'Guatemala',
      stroke: '#4997d0',
      marker: {
        fill: '#4997d0',
        stroke: '#4997d0',
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'nicaragua',
      yName: 'Nicaragua',
      stroke: '#2868c1',
      marker: {
        fill: '#ffffff',
        stroke: '#2868c1',
      },
    },
    {
      type: 'line',
      xKey: 'week',
      yKey: 'brazil',
      yName: 'Brazil',
      stroke: '#459945',
      marker: {
        fill: '#459945',
        stroke: '#459945',
      },
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
      title: {
        text: 'Week',
      },
      label: {
        formatter: params => (params.index % 3 ? '' : params.value),
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        text: '£ per kg',
      },
      nice: false,
      min: 0.2,
      max: 1,
    },
  ],
  legend: {
    position: 'bottom',
    item: {
      paddingY: 15
    },
    spacing: 30,
  },
}

var chart = AgChart.create(options)
