import { AgChartOptions, AgChart } from 'ag-charts-community'
import { data } from './data'

const options: AgChartOptions = {
  type: 'hierarchy',
  container: document.getElementById('myChart'),
  data,
  series: [
    {
      type: 'treemap',
      labelKey: 'name', // defaults to 'label', but current dataset uses 'name'
      sizeKey: 'size', // default (can be omitted for current dataset)
      colorKey: 'color', // default (can be omitted for current dataset)
      tooltip: {
        renderer: params => {
          return {
            content: `<b>Change</b>: ${(params.datum[params.colorKey!]).toFixed(2)}%`,
          }
        },
      },
      formatter: params => ({ stroke: params.depth < 2 ? 'transparent' : 'black' }),
      labels: {
        value: {
          formatter: params => `${params.datum.color.toFixed(2)}%`,
        },
      },
    },
  ],
  title: {
    text: 'S&P 500 index stocks categorized by sectors and industries.',
  },
  subtitle: {
    text:
      'Area represents market cap. Color represents change from the day before.',
  },
}

AgChart.create(options)
