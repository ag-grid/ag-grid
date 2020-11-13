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
        marker: {
            enabled: true
        }
    }]
}

agCharts.AgChart.create(options);