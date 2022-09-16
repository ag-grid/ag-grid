import { AgChartOptions } from 'ag-charts-community';
import * as agCharts from 'ag-charts-community';

const data = [
 { name: 'Covered', count: 17000 },
 { name: 'Not Covered', count: 3000 },
];
const total = data.reduce((sum, d) => sum + d.count, 0);
const percentage = (value: number) => `${(value / total * 100).toFixed()}%`

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  data,
  series: [
    {
      type: 'pie',
      angleKey: 'count',
      fills: ['#358ccb', '#d0d4d6'],
      strokeWidth: 0,
      innerRadiusOffset: -20,
      innerTextLines: [
        { 
          text: percentage(data[0].count),
          color: '#358ccb',
          fontSize: 72,
        },
        { 
          text: 'Coverage',
          fontSize: 24,
          margin: 4,
        },
      ],
    },
  ],
}

agCharts.AgChart.create(options)
