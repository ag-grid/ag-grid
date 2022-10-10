import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from './data';

const data = getData();
const numFormatter = new Intl.NumberFormat('en-US');
const total = data.reduce((sum, d) => sum + d['2018/19'], 0);

const _fills = [
    '#499fca',
    '#57bc7b',
    '#bcdf72',
    '#fbeb37',
    '#62507c',
    '#b7b5ba',
];

const fills = [
    '#db7451',
    '#e4a944',
    '#57bc7b',
    '#499fca',
    '#3978cc',
    '#62507c',
    '#b489a5',
    '#b7b5ba',
];

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    autoSize: true,
    data,
    title: {
        text: 'Dwelling Fires (UK)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Home Office',
    },
    series: [
        {
            type: 'pie',
            calloutLabelKey: 'type',
            fillOpacity: 0.9,
            strokeWidth: 0,
            angleKey: '2018/19',
            sectorLabelKey: '2018/19',
            calloutLabel: {
                enabled: false,
            },
            sectorLabel: {
                color: 'white',
                fontWeight: 'bold',
                formatter: ({datum, sectorLabelKey}) => {
                    const value = datum[sectorLabelKey!];
                    return numFormatter.format(value);
                }
            },
            title: {
                text: '2018/19',
            },
            fills,
            innerRadiusRatio: 0.5,
            innerLabels: [
                {
                    text: numFormatter.format(total),
                    fontSize: 24,
                    fontWeight: 'bold',
                },
                {
                    text: 'Total',
                    fontSize: 16,
                },
            ],
            highlightStyle: {
                item: {
                    fillOpacity: 0,
                    stroke: '#535455',
                    strokeWidth: 1,
                },
            },
        },
    ],
};

const chart = agCharts.AgChart.create(options);
