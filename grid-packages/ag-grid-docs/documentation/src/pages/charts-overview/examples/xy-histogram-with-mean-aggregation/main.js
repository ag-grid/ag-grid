var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Vehicle fuel efficiency by engine size (USA 1987)',
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
            yKey: 'highway-mpg',
            yName: 'Highway MPG',
            fill: '#41874b',
            stroke: '#41874b',
            fillOpacity: 0.5,
            aggregation: 'mean'
        },
        {
            type: 'scatter',
            xKey: 'engine-size',
            xName: 'Engine Size',
            yKey: 'highway-mpg',
            yName: 'Highway MPG',
            fill: '#333',
            stroke: '#333',
            fillOpacity: 0.5
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
                text: 'Highway MPG'
            }
        }
    ],
    legend: {
        enabled: false,
    }
};

var chart = agCharts.AgChart.create(options);
