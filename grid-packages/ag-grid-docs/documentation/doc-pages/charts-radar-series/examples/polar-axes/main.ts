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
            stroke: 'black',
            strokeWidth: 4,
            marker: {
                fill: 'black',
                size: 10,
            },
        },
        {
            type: 'radar-line',
            angleKey: 'subject',
            radiusKey: 'tony',
            radiusName: `Tony's grades`,
            stroke: 'blue',
            strokeWidth: 4,
            marker: {
                fill: 'blue',
                size: 10,
            },
        },
    ],
    legend: {
        enabled: true,
    },
    axes: [
        {
            type: 'angle-category',
            line: { width: 2, color: 'red' }, // outer line
            tick: { width: 2, color: 'red' }, // outer tick lines
            gridStyle: [{ stroke: 'red', lineDash: [2, 2] }], // inner grid
            shape: 'circle',
            label: { autoRotate: true },
        },
        {
            type: 'radius-number',
            title: { text: 'Grades (0-10)', color: 'gray' },
            line: { width: 2, color: 'green' }, // radius axis line
            tick: { width: 2, color: 'green', minSpacing: 10 }, // radius axis tick lines
            shape: 'circle',
            gridStyle: [{ stroke: 'green', lineDash: [2, 2] }], // inner grid
            label: { autoRotate: true, color: 'green', fontWeight: 'bold' },
        },
    ],
};

const chart = AgEnterpriseCharts.create(options);
