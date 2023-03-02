import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from './data';

const data = getData();
const numFormatter = new Intl.NumberFormat('en-US');
const total = data.reduce((sum, d) => sum + d['count'], 0);

const year = new Date().getFullYear();
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
            angleKey: 'count',
            sectorLabelKey: 'count',
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
                text: `${year - 1}`,
            },
            fills: [
                '#fb7451',
                '#f4b944',
                '#57cc8b',
                '#49afda',
                '#3988dc',
                '#72508c',
                '#b499b5',
                '#b7b5ba',
            ],
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
            tooltip: {
                renderer: ({ datum, calloutLabelKey, title, sectorLabelKey }) => {
                    return { title, content: `${datum[calloutLabelKey!]}: ${numFormatter.format(datum[sectorLabelKey!])}` };
                },
            },
        },
    ],
};

const chart = AgChart.create(options);
