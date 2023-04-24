import { AgChartOptions, AgChart } from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'GDP by country in billions of USD (2018)',
  },
  data: [
    {
      country: 'Spain',
      gdp: 1419,
    },
    {
      country: 'UK',
      gdp: 2855,
    },
    {
      country: 'Germany',
      gdp: 3948,
    },
    {
      country: 'France',
      gdp: 2778,
    },
  ],
  series: [
    {
      type: 'column',
      xKey: 'country',
      yKey: 'gdp',
      showInLegend: false,
      formatter: (params) => {
        return {
          fill:
            params.datum[params.xKey] === 'UK'
              ? params.highlighted
                ? 'lime'
                : 'red'
              : params.fill,
        }
      },
    },
  ],
}

AgChart.create(options)
