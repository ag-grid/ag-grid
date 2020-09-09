var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Change in Number of Jobs in UK (June to September 2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    series: [{
        type: 'bar',
        xKey: 'job',
        yKeys: ['change'],
        fills: ['rgba(0, 117, 163, 0.9)'],
        strokes: ['rgba(0, 117, 163, 0.9)'],
        highlightStyle: {
            fill: '#0ab9ff',
        },
        label: {
            fontWeight: 'bold',
            color: 'white',
            formatter: function(params) { return (params.value > 0 ? '+' : '') + params.value; }
        },
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
                text: 'Change in number of jobs (thousands)'
            }
        }
    ],
    legend: {
        enabled: false
    },
};

var chart = agCharts.AgChart.create(options);
