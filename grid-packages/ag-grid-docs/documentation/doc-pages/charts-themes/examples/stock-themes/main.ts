import { AgChartOptions, AgChartTheme } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  theme: 'ag-default-dark',
  autoSize: true,
  padding: {
    left: 70,
    right: 70,
  },
  title: {
    text: 'Chart Theme Example',
  },
  data: [
    { label: 'Android', value: 56.9, other: 7 },
    { label: 'iOS', value: 22.5, other: 8 },
    { label: 'BlackBerry', value: 6.8, other: 9 },
    { label: 'Symbian', value: 8.5, other: 10 },
    { label: 'Bada', value: 2.6, other: 11 },
    { label: 'Windows', value: 1.9, other: 12 },
  ],
  series: [
    {
      type: 'pie',
      angleKey: 'value',
      calloutLabelKey: 'label',
    },
  ],
}

var chart = agCharts.AgChart.create(options)

function applyTheme(theme: AgChartTheme) {
  options.theme = theme
  agCharts.AgChart.update(chart, options)
}
