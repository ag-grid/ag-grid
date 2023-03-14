import { AgChart, AgChartOptions, AgPolarSeriesOptions } from 'ag-charts-community';
import { getData2020, getData2022 } from './data';

const numFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });

const sharedSeriesOptions: AgPolarSeriesOptions = {
    sectorLabelKey: 'share',
    angleKey: 'share',
    sectorLabel: {
        color: 'white',
        fontWeight: 'bold',
        formatter: ({ datum, sectorLabelKey }) => {
            return numFormatter.format(datum[sectorLabelKey!]);
        },
    },
    fills: [
        '#49afda',
        '#57cc8b',
        '#f4b944',
        '#fb7451',
        '#b7b5ba',
    ],
    strokeWidth: 0,
    tooltip: {
        renderer: ({ datum, color, sectorLabelKey }) => {
            return [
                `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">2020</div>`,
                `<div style="padding: 4px 8px;">`,
                `  <strong>${datum['browser']}:</strong> ${numFormatter.format(datum[sectorLabelKey!])}`,
                `</div>`,
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
};

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    autoSize: true,
    title: {
        text: 'Desktop Browser Market Share 2020 vs 2022',
        fontSize: 18,
    },
    subtitle: {
        text: '',
    },
    padding: {
        top: 32,
        right: 20,
        bottom: 20,
        left: 20,
    },
    series: [
        {
            type: 'pie',
            ...sharedSeriesOptions,
            data: getData2020(),
            outerRadiusRatio: 0.5,
            title: {
                text: 'January 2020',
                fontWeight: 'bold',
            },
        },
        {
            type: 'pie',
            ...sharedSeriesOptions,
            data: getData2022(),
            innerRadiusRatio: 0.7,
            title: {
                text: 'September 2022',
                fontWeight: 'bold',
            },
            calloutLabelKey: 'browser',
            calloutLabel: {
                minAngle: 25,
            },
            calloutLine: {
                strokeWidth: 1,
            },
            strokes: [
                'black',
            ],
        },
    ],
};

const chart = AgChart.create(options);
