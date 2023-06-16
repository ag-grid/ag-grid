import {AgChartOptions, AgChart} from 'ag-charts-community';
import {getData} from './data';

function formatSize(value: number) {
    const e = Math.min(3, Math.floor(Math.log(value) / Math.log(1024)));
    const prefix = ['B', 'KB', 'MB', 'GB'][e];
    return `${Math.round(value / Math.pow(1024, e))}${prefix}`;
}

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    series: [
        {
            type: 'treemap',
            labelKey: 'name',
            gradient: false,
            nodePadding: 20, // padding for tile content
            nodeGap: 10, // spacing between neighbouring tiles
            sizeKey: 'size',
            colorKey: 'size',
            labels: {
                value: {
                    key: 'size',
                    formatter: ({datum}) => formatSize(datum.size),
                },
            },
            groupFill: '#241248',
            colorDomain: [0, 1200000000],
            colorRange: ['#241248', '#2a9850'],
            groupStroke: 'white',
            tileStroke: 'white',
            tooltip: {
                renderer: (params) => {
                    return params.depth === 2 ? { content: formatSize(params.datum.size) } : { content: '' };
                },
            },
            formatter: (params) => {
                return params.depth === 0 ? { fill: '#120024' } : {};
            },
        },
    ],
    title: {
        text: 'My Computer',
    },
    subtitle: {
        text: 'Disk Size',
    },
};

AgChart.create(options);
