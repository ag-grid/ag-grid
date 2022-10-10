import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from './data';

const numFormatter = new Intl.NumberFormat('en-US');
const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usdShortFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' } as any);

const fills = [
    '#db7451',
    '#e4a944',
    '#499fca',
];

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    autoSize: true,
    title: {
        text: 'The GDP of Baltic States',
        fontSize: 18,
    },
    subtitle: {
        text: 'Population (Angle) & GDP per Capita (Radius)',
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
            calloutLabelKey: 'country',
            sectorLabelKey: 'gdpPerCapita',
            angleKey: 'population',
            radiusKey: 'gdpPerCapita',
            calloutLabel: {
                minAngle: 0,
            },
            sectorLabel: {
                color: 'white',
                fontWeight: 'bold',
                formatter: ({ datum }) => {
                    return usdShortFormatter.format(datum['population'] * datum['gdpPerCapita']);
                },
            },
            calloutLine: {
                strokeWidth: 1,
                colors: ['black'],
            },
            fills,
            strokeWidth: 0,
            tooltip: {
                renderer: ({ datum, color }) => {
                    return [
                        `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; font-weight: bold; color: white;">${datum['country']}</div>`,
                        `<div style="padding: 4px 8px"><strong>Population:</strong> ${numFormatter.format(datum['population'])}</div>`,
                        `<div style="padding: 4px 8px"><strong>GDP per Capita:</strong> ${usdFormatter.format(datum['gdpPerCapita'])}</div>`,
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
}

const chart = agCharts.AgChart.create(options);
