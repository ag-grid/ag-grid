import * as agCharts from 'ag-charts-community';
import { getData } from './data';

const options: agCharts.AgChartOptions = {
    type: 'hierarchy',
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
            formatter: ({ datum, depth, parent, highlighted }) => {
                if (depth < 2) {
                    return {};
                }

                const stroke = highlighted ? 'black' : 'white';
                const mainColor = parent.name === 'Foodstuffs' ? [224, 64, 32] : [32, 92, 224];
                const siblings = parent.children.sort((a, b) => b.exports - a.exports);
                const lightness = siblings.indexOf(datum) / siblings.length;
                const color = mainColor.map((v) => v * (1 - 0.5 * lightness));
                const fill = `rgb(${color.join(',')})`;
                return { fill, stroke };
            },
        } as agCharts.AgTreemapSeriesOptions,
    ],
    title: {
        text: 'Exports of Krakozhia in 2022',
    },
    subtitle: {
        text: 'in millions US dollars',
    },
}

agCharts.AgChart.create(options);
