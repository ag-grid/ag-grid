
var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Race results'
    },
    data: histogramData,
    series: [{
        type: 'histogram',
        aggregation: 'mean',
        xKey: 'age',
        xName: 'Participant Age',
        yKey: 'time',
        yName: 'Race time'
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
            title: { text: 'Mean race time (seconds)' }
        },
    ],
};

agCharts.AgChart.create(options);