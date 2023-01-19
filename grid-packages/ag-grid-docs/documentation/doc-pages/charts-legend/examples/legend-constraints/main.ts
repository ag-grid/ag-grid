import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const colors = [
  '#AC9BF5',
  '#5984C2',
  '#36A883',
  '#F5CA46',
  '#F5546F',
  '#8B6FB8',
  '#E8A7F0',
  '#7BAFDF',
  '#65CC8D',
  '#F57940',
  '#B2DB6A',
  '#32B33B',
  '#758080',
  '#284E8F',
  '#F5BFAE',
  '#D65653',
  '#B3AC4C',
  '#758080',
  '#A0CEF5',
  '#357A72',
];

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  theme: {
    palette: {
      fills: colors,
      strokes: colors,
    },
    overrides: {
      polar: {
        series: {
          pie: {
            calloutLabel: {
              enabled: false
            },
            highlightStyle: {
              item: {
                fill: undefined,
                strokeWidth: 1,
              },
            },
          },
        },
      },
    },
  },
  data: [
    { label: 'USA', value: 56.9 },
    { label: 'UK', value: 22.5 },
    { label: 'China', value: 6.8 },
    { label: 'Russia', value: 8.5 },
    { label: 'India', value: 2.6 },
    { label: 'Germany', value: 18.2 },
    { label: 'France', value: 12.5 },
    { label: 'Canada', value: 3.9 },
    { label: 'Spain', value: 7.9 },
    { label: 'South Africa', value: 21.9 },
  ],
  series: [
    {
      type: 'pie',
      angleKey: 'value',
      calloutLabelKey: 'label',
      strokeWidth: 3,
    },
  ],
  legend: {
    position: 'bottom',
    maxHeight: 200,
    item: {
      maxWidth: 130,
      paddingX: 32,
      paddingY: 8,
      marker: {
        padding: 8,
      },
    },
  },
}

var chart = agCharts.AgChart.create(options);

function updateLegendItemPaddingX(event: any) {
  var value = +event.target.value;

  options.legend!.item!.paddingX = value;
  agCharts.AgChart.update(chart, options);

  document.getElementById('xPaddingValue')!.innerHTML = String(value);
}

function updateLegendItemPaddingY(event: any) {
  var value = event.target.value;

  options.legend!.item!.paddingY = +event.target.value;
  agCharts.AgChart.update(chart, options);

  document.getElementById('yPaddingValue')!.innerHTML = String(value);
}

function updateLegendItemSpacing(event: any) {
  var value = +event.target.value;

  options.legend!.item!.marker!.padding = value;
  agCharts.AgChart.update(chart, options);

  document.getElementById('markerPaddingValue')!.innerHTML = String(value);
}

function updateLegendItemMaxWidth(event: any) {
  var value = +event.target.value;

  options.legend!.item!.maxWidth = value;
  agCharts.AgChart.update(chart, options);

  document.getElementById('maxWidthValue')!.innerHTML = String(value);
}