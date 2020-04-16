
var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Race demographics'
    },
    subtitle: {
        text: 'Number of participants by age'
    },
    data: histogramData,
    series: [{
        type: 'histogram',
        xKey: 'age',
        xName: 'Participant Age',
        binCount: 20
    }],
    legend: {
        enabled: false
    },
    axes: [
        {
            type: 'number',
            position: 'bottom',
            title: { text: 'Age (years)' }
        },
        {
            type: 'number',
            position: 'left',
            title: { text: 'Number of participants' }
        },
    ]
};

agCharts.AgChart.create(options);