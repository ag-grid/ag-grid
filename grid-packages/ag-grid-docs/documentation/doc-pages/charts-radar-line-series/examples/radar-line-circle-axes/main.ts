import { AgEnterpriseCharts, AgChartOptions } from 'ag-charts-enterprise';
import { getData } from './data';

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    title: {
        text: 'School Grades',
    },
    series: [
        {
            type: 'radar-line',
            angleKey: 'subject',
            radiusKey: 'mike',
            radiusName: `Mike's grades`,
            stroke: 'red',
            strokeWidth: 2,
            marker: {
                fill: 'red',
                size: 10,
            },
        },
        {
            type: 'radar-line',
            angleKey: 'subject',
            radiusKey: 'tony',
            radiusName: `Tony's grades`,
            stroke: 'blue',
            strokeWidth: 2,
            marker: {
                fill: 'blue',
                size: 10,
            },
        },
    ],
    legend: {
        enabled: true,
    },
};

const chart = AgEnterpriseCharts.create(options);
