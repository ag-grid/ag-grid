var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Height vs Weight for Major League Baseball Players',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Statistics Online Computational Resource',
    },
    series: [
        {
            type: 'scatter',
            xKey: 'weight',
            yKey: 'height',
            fill: '#002D72',
            fillOpacity: 0.5,
            strokeOpacity: 0,
            marker: {
                size: 12,
            }
        }
    ],
    axes: [
        {
            position: 'bottom',
            type: 'number',
            title: {
                text: 'Weight (pounds)'
            }
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Height (inches)'
            }
        }
    ],
    legend: {
        enabled: false,
    }
};

var chart = agCharts.AgChart.create(options);
