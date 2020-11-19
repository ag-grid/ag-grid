
var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Race demographics'
    },
    data: histogramData,
    series: [{
        type: 'histogram',
        xKey: 'age',
        xName: 'Participant Age'
    }],
    legend: {
        enabled: false
    },
    axes: [
        {
            type: 'number',
            position: 'bottom',
            title: { text: 'Age band (years)' }
        },
        {
            type: 'number',
            position: 'left',
            title: { text: 'Number of participants' }
        },
    ]
};

agCharts.AgChart.create(options);