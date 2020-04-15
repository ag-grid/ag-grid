
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
        aggregation: 'mean',
        xKey: 'age',
        xName: 'Participant Age',
        binCount: 100
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