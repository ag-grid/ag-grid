var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Vehicle weight distribution (USA 1987)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: UCI',
    },
    series: [
        {
            type: 'histogram',
            xKey: 'curb-weight',
            xName: 'Curb weight',
            fillOpacity: 0.5,
            fill: '#8888ff',
            stroke: '#000',
            bins:[[0, 2000], [2000, 3000], [3000, 4500]],
            areaPlot: true
        }
    ],
    axes: [
        {
            position: 'bottom',
            type: 'number',
            title: {
                text: 'Curb weight (pounds)'
            },
        },
        {
            position: 'left',
            type: 'number',
            label: {
                formatter:function() { return "" }
            }
        }
    ],
    legend: {
        enabled: false,
    }
};

var chart = agCharts.AgChart.create(options);
