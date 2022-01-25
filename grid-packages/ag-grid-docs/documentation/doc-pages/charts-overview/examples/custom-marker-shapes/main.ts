import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

var fills: string[] = [
  '#f3622d',
  '#fba71b',
  '#57b757',
  '#41a9c9',
  '#4258c9',
  '#9a42c8',
  '#c84164',
  '#888888',
]

var strokes: string[] = [
  '#aa4520',
  '#b07513',
  '#3d803d',
  '#2d768d',
  '#2e3e8d',
  '#6c2e8c',
  '#8c2d46',
  '#5f5f5f',
]

var colourIndex = 0
var markerSize = 10

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'Taxed Alcohol Consumption (UK)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: HM Revenue & Customs',
  },
  series: [
    {
      type: 'line',
      title: 'Still wine',
      xKey: 'year',
      yKey: 'stillWine',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: 'circle',
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
    {
      type: 'line',
      title: 'Sparkling wine',
      xKey: 'year',
      yKey: 'sparklingWine',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: 'cross',
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
    {
      type: 'line',
      title: 'Made-wine',
      xKey: 'year',
      yKey: 'madeWine',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: 'diamond',
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
    {
      type: 'line',
      title: 'Whisky',
      xKey: 'year',
      yKey: 'whisky',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: 'plus',
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
    {
      type: 'line',
      title: 'Potable spirits',
      xKey: 'year',
      yKey: 'potableSpirits',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: 'square',
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
    {
      type: 'line',
      title: 'Beer',
      xKey: 'year',
      yKey: 'beer',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: 'triangle',
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
    {
      type: 'line',
      title: 'Cider',
      xKey: 'year',
      yKey: 'cider',
      stroke: fills[colourIndex],
      marker: {
        size: markerSize,
        shape: heartFactory(),
        fill: fills[colourIndex],
        stroke: strokes[colourIndex++],
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'category',
      label: {
        rotation: -30,
      },
    },
    {
      position: 'left',
      type: 'number',
      title: {
        enabled: true,
        text: 'Volume (hectolitres)',
      },
      label: {
        formatter: function (params) {
          return params.value / 1000000 + 'M'
        },
      },
    },
  ],
}

var chart = agCharts.AgChart.create(options)

function heartFactory() {
  class Heart extends agCharts.Marker {
    rad(degree: number) {
      return degree / 180 * Math.PI;
    }

    updatePath() {
      const { x, path, size, rad } = this;
      const r = size / 4;
      const y = this.y + r / 2;

      path.clear();
      path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
      path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
      path.lineTo(x, y + r);
      path.closePath();
    }
  }
  return Heart;
}
