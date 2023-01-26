import { AgChartOptions, AgChart } from 'ag-charts-community'

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
  autoSize: false,
  width: 1000,
  height: 430,
  theme: {
    palette: {
      fills: colors,
      strokes: colors,
    },
    overrides: {
      polar: {
        series: {
          pie: {
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
    { label: 'Portugal', value: 7.4 },
    { label: 'Netherlands', value: 4.7 },
    { label: 'Finland', value: 3.9 },
    { label: 'Sweden', value: 3.3 },
    { label: 'Norway', value: 3.2 },
    { label: 'Greece', value: 1.9 },
    { label: 'Italy', value: 2.5 },
  ],
  series: [
    {
      type: 'pie',
      angleKey: 'value',
      calloutLabelKey: 'label',
      strokeWidth: 3,
      calloutLabel: {
        enabled: false
      }
    },
  ],
  legend: {
    position: 'bottom',
  },
}

var chart = AgChart.create(options)

function updateWidth(event: any) {
  var value = +event.target.value

  options.width = value
  AgChart.update(chart, options)

  document.getElementById('sliderValue')!.innerHTML = String(value)
}
