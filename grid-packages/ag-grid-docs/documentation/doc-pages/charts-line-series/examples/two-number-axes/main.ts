import { AgChartOptions, AgChart } from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: false,
  data: generateSpiralData(),
  width: 550,
  height: 550,
  series: [
    {
      xKey: 'x',
      yKey: 'y',
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
    },
    {
      type: 'number',
      position: 'bottom',
    },
  ],
  legend: {
    enabled: false,
  },
}

AgChart.create(options)

function generateSpiralData() {
  // r = a + bθ
  // x = r * Math.cos(θ)
  // y = r * Math.sin(θ)
  var a = 1
  var b = 1
  var data = []
  var step = 0.1

  for (var th = 1; th < 50; th += step) {
    var r = a + b * th
    data.push({
      x: r * Math.cos(th),
      y: r * Math.sin(th),
    })
  }

  return data
}
