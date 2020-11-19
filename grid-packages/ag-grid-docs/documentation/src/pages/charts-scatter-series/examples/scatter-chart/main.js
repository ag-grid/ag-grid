var options = {
    autoSize: true,
    title: {
        text: 'Mean Sea Level (mm)'
    },
    container: document.getElementById('myChart'),
    data: seaLevelData,
    series: [{
        type: 'scatter',
        xKey: 'time',
        yKey: 'mm',
        showInLegend: false
    }],
    axes: [
        {
            type: 'number',
            position: 'bottom'
        },
        {
            type: 'number',
            position: 'left'
        }
    ]
};

agCharts.AgChart.create(options);