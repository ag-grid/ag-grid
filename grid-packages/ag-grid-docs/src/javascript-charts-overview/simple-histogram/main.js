var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Engine size distribution (USA 1987)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: UCI',
    },
    series: [
        {
            type: 'histogram',
            xKey: 'engine-size',
            xName: 'Engine Size',
            fillOpacity: 0.5,
            aggregation: 'mean'
        }
    ],
    axes: [
        {
            position: 'bottom',
            type: 'number',
            title: {
                text: 'Engine Size (Cubic inches)'
            },
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Frequency'
            }
        }
    ],
    legend: {
        enabled: false,
    }
};

var chart = agCharts.AgChart.create(options);
