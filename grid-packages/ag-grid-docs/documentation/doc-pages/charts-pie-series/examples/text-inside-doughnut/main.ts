import {AgChartOptions} from 'ag-charts-community';
import * as agCharts from 'ag-charts-community';
import {getData} from './data';

const data = getData();
const total = data.reduce((sum, d) => sum + d.count, 0);
const percentage = (value: number) => `${(value / total * 100).toFixed()}%`

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data,
    series: [
        {
            type: 'pie',
            angleKey: 'count',
            fills: ['#35ab7c', '#dff3ea'],
            strokeWidth: 0,
            innerRadiusOffset: -20,
            innerLabels: [
                {
                    text: percentage(data[0].count),
                    color: '#35ab7c',
                    fontSize: 72,
                },
                {
                    text: 'Coverage',
                    fontSize: 24,
                    margin: 4,
                },
            ],
            innerCircle: {
                fill: '#dff3ea',
            }
        },
    ],
}

agCharts.AgChart.create(options)
