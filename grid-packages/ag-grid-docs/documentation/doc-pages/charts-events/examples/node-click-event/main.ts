import { AgChartOptions, AgChart } from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Number of Cars Sold',
  },
  subtitle: {
    text: '(click a column for details)',
  },
  data: [
    { month: 'March', units: 25, brands: { BMW: 10, Toyota: 15 } },
    { month: 'April', units: 27, brands: { Ford: 17, BMW: 10 } },
    { month: 'May', units: 42, brands: { Nissan: 20, Toyota: 22 } },
  ],
  series: [
    {
      type: 'column',
      xKey: 'month',
      yKey: 'units',
      listeners: {
        nodeClick: (event: any) => {
          var datum = event.datum
          window.alert(
            'Cars sold in ' +
            datum[event.xKey] +
            ': ' +
            String(datum[event.yKey]) +
            '\n' +
            listUnitsSoldByBrand(datum['brands'])
          )
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
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)

function listUnitsSoldByBrand(brands: Record<string, number>) {
  var result = ''
  for (var key in brands) {
    result += key + ': ' + brands[key] + '\n'
  }
  return result
}
