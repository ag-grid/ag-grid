var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Total Visitors to Tate Galleries',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Digital, Culture, Media & Sport',
    },
    series: [{
        type: 'area',
        xKey: 'date',
        yKeys: [
            'Tate Modern',
        ],
        fills: ['#c16068'],
        fillOpacity: 0.8,
        strokes: ['#874349'],
    },
    {
        type: 'area',
        xKey: 'date',
        yKeys: [
            'Tate Britain',
        ],
        fills: ['#a2bf8a'],
        fillOpacity: 0.8,
        strokes: ['#718661'],
    },
    {
        type: 'area',
        xKey: 'date',
        yKeys: [
            'Tate Liverpool',
        ],
        fills: ['#ebcc87'],
        fillOpacity: 0.8,
        strokes: ['#a48f5f'],
    },
    {
        type: 'area',
        xKey: 'date',
        yKeys: [
            'Tate St Ives',
        ],
        fills: ['#80a0c3'],
        fillOpacity: 0.8,
        strokes: ['#5a7088'],
    }],
    axes: [
        {
            type: 'time',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Total visitors',
            },
            label: {
                formatter: function(params) { return params.value / 1000 + 'k'; },
            },
        }],
    legend: {
        position: 'bottom',
    },
};

var chart = agCharts.AgChart.create(options);
