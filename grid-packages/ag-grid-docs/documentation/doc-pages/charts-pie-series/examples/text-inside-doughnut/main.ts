import { AgChartOptions } from 'ag-charts-community';
import * as agCharts from 'ag-charts-community';

const data = [
 { name: 'Covered', count: 15000 },
 { name: 'Not Covered', count: 5000 },
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
      fills: ['#2398c4', '#c3c4c5'],
      strokeWidth: 0,
      innerRadiusOffset: -20,
      innerTextLines: [
        { 
          text: percentage(data[0].count),
          color: '#2398c4',
          fontSize: 72,
        },
        { 
          text: 'Coverage',
          fontSize: 24,
        },
      ],
    },
  ],
}

agCharts.AgChart.create(options)
