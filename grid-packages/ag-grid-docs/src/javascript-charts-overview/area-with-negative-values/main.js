var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Changes in UK Energy Stock (2018)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Business, Energy & Industrial Strategy',
    },
    series: [
        {
            type: 'area',
            xKey: 'quarter',
            yKeys: ['naturalGas'],
            yNames: ['Natural gas'],
            fills: ['#FA7921'],
            strokes: ['#af5517'],
            fillOpacity: 0.6,
        },
        {
            type: 'area',
            xKey: 'quarter',
            yKeys: ['coal'],
            yNames: ['Coal'],
            fills: ['#5BC0EB'],
            strokes: ['#4086a4'],
            fillOpacity: 0.6,
        },
        {
            type: 'area',
            xKey: 'quarter',
            yKeys: ['primaryOil'],
            yNames: ['Primary oil'],
            fills: ['#9BC53D'],
            strokes: ['#6c8a2b'],
            fillOpacity: 0.6,
        },
        {
            type: 'area',
            xKey: 'quarter',
            yKeys: ['petroleum'],
            yNames: ['Petroleum'],
            fills: ['#E55934'],
            strokes: ['#a03e24'],
            fillOpacity: 0.6,
        },
        {
            type: 'area',
            xKey: 'quarter',
            yKeys: ['manufacturedFuels'],
            yNames: ['Manufactured fuels'],
            fills: ['#FDE74C'],
            strokes: ['#b1a235'],
            fillOpacity: 0.6,
        },
    ],
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Thousand tonnes of oil equivalent',
            },
        }],
    legend: {
        position: 'bottom',
    },
};

var chart = agCharts.AgChart.create(options);
