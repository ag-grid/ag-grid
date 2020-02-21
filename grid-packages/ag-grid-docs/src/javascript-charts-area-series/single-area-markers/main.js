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
        yNames: ['IE'],
        marker: {
            enabled: true
        },
        tooltipRenderer: function (params) {
            var datum = params.datum;
            var xKey = params.xKey;
            var yKey = params.yKey;
            var text = params.yName + ' - ' + datum[yKey] + '% - Jan ' + datum[xKey];
            return '<div style="padding: 10px;">' + text + '</div>';
        }
    }],
    legend: {
        enabled: false
    }
};

agCharts.AgChart.create(options);