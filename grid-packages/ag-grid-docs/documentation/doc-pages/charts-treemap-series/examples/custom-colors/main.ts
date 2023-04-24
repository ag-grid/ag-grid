import { AgChartOptions, AgTreemapSeriesOptions, AgChart } from 'ag-charts-community';
import { getData } from './data';

const options: AgChartOptions = {
    container: document.getElementById('myChart'),
    data: getData(),
    series: [
        {
            type: 'treemap',
            labelKey: 'name',
            gradient: false,
            nodePadding: 2,
            sizeKey: 'exports',
            tileStroke: 'white',
            tileStrokeWidth: 1,
            labelShadow: {
                enabled: false,
            },
            groupFill: 'transparent',
            title: {
                color: 'black',
            },
            subtitle: {
                color: 'black',
            },
            labels: {
                value: {
                    name: 'Exports',
                    formatter: (params) => `$${params.datum.exports}M`,
                },
            },
            groupStrokeWidth: 0,
            highlightGroups: false,
            highlightStyle: {
                text: {
                    color: undefined,
                },
            },
            formatter: ({ depth, parent, highlighted }) => {
                if (depth < 2) {
                    return {};
                }

                const fill = parent.name === 'Foodstuffs' ? 'rgb(64, 172, 64)' : 'rgb(32, 96, 224)';
                const stroke = highlighted ? 'black' : 'white';
                return { fill, stroke };
            },
        } as AgTreemapSeriesOptions,
    ],
    title: {
        text: 'Exports of Krakozhia in 2022',
    },
    subtitle: {
        text: 'in millions US dollars',
    },
}

AgChart.create(options);
