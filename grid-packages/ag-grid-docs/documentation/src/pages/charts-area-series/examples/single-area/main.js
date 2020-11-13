var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Internet Explorer Market Share'
    },
    subtitle: {
        text: '2009-2019 (aka "good times")'
    },
    data: browserData,
    series: [{
        type: 'area',
        xKey: 'year',
        yKeys: ['ie'],
        yNames: ['IE']
    }],
    legend: {
        enabled: false
    }
};

agCharts.AgChart.create(options);