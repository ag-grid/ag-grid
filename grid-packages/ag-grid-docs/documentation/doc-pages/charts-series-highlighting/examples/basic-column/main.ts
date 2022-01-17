import { Grid, AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

var data = [
  {
    beverage: 'Coffee',
    Q1: 450,
    Q2: 560,
    Q3: 600,
    Q4: 700,
  },
  {
    beverage: 'Tea',
    Q1: 270,
    Q2: 380,
    Q3: 450,
    Q4: 520,
  },
  {
    beverage: 'Milk',
    Q1: 180,
    Q2: 170,
    Q3: 190,
    Q4: 200,
  },
]

const options: AgChartOptions = {
  data: data,
  container: document.body,
  title: {
    text: 'Beverage Expenses',
  },
  subtitle: {
    text: 'per quarter',
  },
  series: [
    {
      type: 'column',
      xKey: 'beverage',
      yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
      highlightStyle: {
        item: {
          fill: 'red',
          stroke: 'maroon',
          strokeWidth: 4,
        },
        series: {
          dimOpacity: 0.2,
          strokeWidth: 2,
        },
      },
    },
  ],
}

agCharts.AgChart.create(options)
