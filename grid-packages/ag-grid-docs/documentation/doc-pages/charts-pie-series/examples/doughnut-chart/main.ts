import { AgChartOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  data: [
    { os: 'Android', share: 56.9 },
    { os: 'iOS', share: 22.5 },
    { os: 'BlackBerry', share: 6.8 },
    { os: 'Symbian', share: 8.5 },
    { os: 'Bada', share: 2.6 },
    { os: 'Windows', share: 1.9 },
  ],
  series: [
    {
      type: 'pie',
      calloutLabelKey: 'os',
      angleKey: 'share',
      innerRadiusOffset: -70,
    },
  ],
}

agCharts.AgChart.create(options)
