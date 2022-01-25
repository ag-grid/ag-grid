import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  title: {
    text: 'WEEE Collected in UK (2019)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Environmental Agency',
  },
  tooltip: {
    class: 'my-tooltip',
  },
  series: [
    {
      type: 'column',
      xKey: 'quarter',
      yKeys: [
        'largeHousehold',
        'smallHousehold',
        'itTelecomms',
        'consumer',
        'tools',
        'displays',
        'cooling',
        'gasLampsLed',
      ],
      yNames: [
        'Large household appliances',
        'Small household appliances',
        'IT and telecomms equipment',
        'Consumer equipment',
        'Electrical and electronic tools',
        'Display equipment',
        'Cooling appliances containing refrigerants',
        'Gas discharge lamps and LED light sources',
      ],
      tooltip: {
        renderer: function (params) {
          var formatThousands = function (value: number) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }

          var tooltipHtml = [
            '<div class="my-tooltip">',
            '<span class="my-tooltip__title" style="color: ' +
            params.color +
            '">' +
            params.yName,
            '(' +
            params.datum[params.xKey] +
            '):</span> ' +
            formatThousands(params.datum[params.yKey]) +
            ' tonnes',
            '</div>',
          ]

          return tooltipHtml.join('\n')
        },
      },
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'bottom',
    },
    {
      type: 'number',
      position: 'left',
      title: {
        enabled: true,
        text: 'Waste collected (tonnes)',
      },
      label: {
        formatter: function (params) {
          return params.value / 1000 + 'k'
        },
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
}

var chart = agCharts.AgChart.create(options)
