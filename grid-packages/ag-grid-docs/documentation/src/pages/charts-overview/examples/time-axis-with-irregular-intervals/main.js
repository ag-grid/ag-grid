var strokes = [
    '#5BC0EB',
    '#FDE74C',
    '#9BC53D',
    '#E55934',
    '#FA7921',
    '#fa3081'
];

var strokeIndex = 0;
var strokeWidth = 3;

var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    title: {
        text: 'Earthquake Magnitudes by Source (January 2020)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: US Geological Survey',
    },
    padding: {
        left: 40,
        right: 40,
    },
    series: [
        {
            data: data.ci,
            type: 'line',
            title: 'Southern California Seismic Network',
            xKey: 'time',
            yKey: 'magnitude',
            stroke: strokes[strokeIndex++],
            strokeWidth: strokeWidth,
            marker: {
                enabled: false,
                fill: strokes[strokeIndex - 1],
            }
        },
        {
            data: data.hv,
            type: 'line',
            title: 'Hawaiian Volcano Observatory Network',
            xKey: 'time',
            yKey: 'magnitude',
            stroke: strokes[strokeIndex++],
            strokeWidth: strokeWidth,
            marker: {
                enabled: false,
                fill: strokes[strokeIndex - 1],
            }
        },
        {
            data: data.nc,
            type: 'line',
            title: 'USGS Northern California Network',
            xKey: 'time',
            yKey: 'magnitude',
            stroke: strokes[strokeIndex++],
            strokeWidth: strokeWidth,
            marker: {
                enabled: false,
                fill: strokes[strokeIndex - 1],
            }
        },
        {
            data: data.ok,
            type: 'line',
            title: 'Oklahoma Seismic Network',
            xKey: 'time',
            yKey: 'magnitude',
            stroke: strokes[strokeIndex++],
            strokeWidth: strokeWidth,
            marker: {
                enabled: false,
                fill: strokes[strokeIndex - 1],
            }
        },
    ],
    axes: [
        {
            position: 'bottom',
            type: 'time',
            label: {
                format: '%d/%m',
                rotation: 30,
            },
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Magnitude'
            }
        }
    ],
    legend: {
        position: 'bottom',
        strokeWidth: 0,
    }
};

var chart = agCharts.AgChart.create(options);
