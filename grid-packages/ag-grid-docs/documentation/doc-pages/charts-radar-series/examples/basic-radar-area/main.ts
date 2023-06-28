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
            type: 'radar-area',
            angleKey: 'subject',
            radiusKey: 'mike',
            radiusName: `Mike's grades`,
        },
        {
            type: 'radar-area',
            angleKey: 'subject',
            radiusKey: 'tony',
            radiusName: `Tony's grades`,
        },
    ],
    legend: {
        enabled: true,
    },
};

const chart = AgEnterpriseCharts.create(options);
