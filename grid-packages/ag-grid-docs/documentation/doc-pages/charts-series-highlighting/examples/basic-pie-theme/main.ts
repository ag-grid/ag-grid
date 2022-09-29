import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const data = [
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
  theme: {
    baseTheme: 'ag-pastel',
    overrides: {
      polar: {
        series: {
          pie: {
            title: {
              showInLegend: true,
            },
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
        },
      },
    },
  },
  series: [
    {
      type: 'pie',
      title: {
        text: 'Q1',
      },
      calloutLabel: {
        enabled: false,
      },
      angleKey: 'Q1',
      calloutLabelKey: 'beverage',
      showInLegend: true,
      outerRadiusOffset: 0,
      innerRadiusOffset: -20,
    },
    {
      type: 'pie',
      title: {
        text: 'Q2',
      },
      calloutLabel: {
        enabled: false,
      },
      angleKey: 'Q2',
      calloutLabelKey: 'beverage',
      outerRadiusOffset: -40,
      innerRadiusOffset: -60,
    },
    {
      type: 'pie',
      title: {
        text: 'Q3',
      },
      calloutLabel: {
        enabled: false,
      },
      angleKey: 'Q3',
      calloutLabelKey: 'beverage',
      outerRadiusOffset: -80,
      innerRadiusOffset: -100,
    },
    {
      type: 'pie',
      title: {
        text: 'Q4',
      },
      calloutLabel: {
        enabled: false,
      },
      angleKey: 'Q4',
      calloutLabelKey: 'beverage',
      outerRadiusOffset: -120,
      innerRadiusOffset: -140,
    },
  ],
}

agCharts.AgChart.create(options)
