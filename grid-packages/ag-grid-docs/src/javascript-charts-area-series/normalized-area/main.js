var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Browser Wars'
    },
    subtitle: {
        text: '2009-2019'
    },
    data: browserData,
    series: [{
        type: 'area',
        xKey: 'year',
        yKeys: ['ie', 'firefox', 'safari', 'chrome'],
        yNames: ['IE', 'Firefox', 'Safari', 'Chrome'],
        normalizedTo: 100,
        marker: {
            enabled: true
        }
    }],
    axes: [{
        type: 'number',
        position: 'left',
        label: {
            formatter: function (params) {
                return params.value + '%';
            }
        }
    }, {
        type: 'category',
        position: 'bottom'
    }]
}

agCharts.AgChart.create(options);