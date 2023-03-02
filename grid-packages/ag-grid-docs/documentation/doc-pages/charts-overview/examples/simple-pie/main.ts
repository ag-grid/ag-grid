import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from './data';

const numFormatter = new Intl.NumberFormat('en-US');

const year = new Date().getFullYear();
const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    autoSize: true,
    title: {
        text: `Religions of London Population (${year - 1})`,
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    padding: {
        top: 32,
        right: 20,
        bottom: 32,
        left: 20,
    },
    series: [
        {
            data: getData(),
            type: 'pie',
            calloutLabelKey: 'religion',
            sectorLabelKey: 'population',
            angleKey: 'population',
            calloutLabel: {
                minAngle: 0,
            },
            sectorLabel: {
                color: 'white',
                fontWeight: 'bold',
                formatter: ({ datum, sectorLabelKey }) => {
                    return numFormatter.format(datum[sectorLabelKey!]);
                },
            },
            calloutLine: {
                strokeWidth: 2,
            },
            fills: [
                '#49afda',
                '#57cc8b',
                '#bcdf72',
                '#fbeb37',
                '#f4b944',
                '#fb7451',
                '#72508c',
                '#b7b5ba',
            ],
            strokeWidth: 0,
            tooltip: {
                renderer: ({ datum, color, calloutLabelKey, sectorLabelKey }) => {
                    return [
                        `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; font-weight: bold; color: white;">${datum[calloutLabelKey!]}</div>`,
                        `<div style="padding: 4px 8px">${numFormatter.format(datum[sectorLabelKey!])}</div>`,
                    ].join('\n');
                },
            },
            highlightStyle: {
                item: {
                    fillOpacity: 0,
                    stroke: '#535455',
                    strokeWidth: 1,
                },
            },
        },
    ],
    legend: {
        enabled: false,
    },
};

const chart = AgChart.create(options);
