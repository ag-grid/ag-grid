
var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Race demographics'
    },
    subtitle: {
        text: 'Number of participants by age category'
    },
    data: histogramData,
    series: [{
        type: 'histogram',
        xKey: 'age',
        xName: 'Participant Age',
        areaPlot: true,
        bins: [[16, 18], [18, 21], [21, 25], [25, 40]]
    }],
    legend: {
        enabled: false
    },
    axes: [
        {
            type: 'number',
            position: 'bottom',
            title: { text: 'Age category (years)' }
        },
        {
            type: 'number',
            position: 'left',
            title: { text: 'Number of participants' }
        },
    ]
};

agCharts.AgChart.create(options);