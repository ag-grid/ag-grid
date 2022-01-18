import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

function getTotal(datum: any) {
  return (
    datum.ownerOccupied +
    datum.privateRented +
    datum.localAuthority +
    datum.housingAssociation
  )
}

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData().sort(function (a: any, b: any) {
    return getTotal(b) - getTotal(a)
  }),
  title: {
    text: 'UK Housing Stock (2016)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Ministry of Housing, Communities & Local Government',
  },
  series: [
    {
      type: 'bar',
      xKey: 'type',
      yKeys: [
        'ownerOccupied',
        'privateRented',
        'localAuthority',
        'housingAssociation',
      ],
      yNames: [
        'Owner occupied',
        'Private rented',
        'Local authority',
        'Housing association',
      ],
      highlightStyle: {
        series: {
          strokeWidth: 3,
          dimOpacity: 0.3,
        },
      },
    },
  ],
  axes: [
    {
      type: 'category',
      position: 'left',
    },
    {
      type: 'number',
      position: 'top',
    },
  ],
  legend: {
    position: 'bottom',
  },
}

var chart = agCharts.AgChart.create(options)
