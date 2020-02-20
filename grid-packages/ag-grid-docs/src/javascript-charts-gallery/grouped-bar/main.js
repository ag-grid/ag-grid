var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Annual Growth in Pay (2018-2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    series: [{
        type: 'bar',
        xKey: 'type',
        yKeys: ['total', 'regular'],
        yNames: ['Annual growth in total pay', 'Annual growth in regular pay'],
        grouped: true,
        fills: ['rgba(0, 117, 163, 0.9)', 'rgba(226, 188, 34, 0.9)'],
        strokes: ['rgba(0, 117, 163, 0.9)', 'rgba(226, 188, 34, 0.9)'],
    }],
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
            title: {
                text: '%'
            }
        }
    ],
    legend: {
        position: 'bottom',
    },
};

var chart = agCharts.AgChart.create(options);
