var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
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
            areaPlot: true,
            tooltipRenderer: function(params) {
                var paramsMax = params.datum.domain[1];
                var sizeName = paramsMax === 2000? 'small': paramsMax === 3000? 'medium' : 'large';

                return '<div class="ag-chart-tooltip-content">' +
                    '<b>' + params.datum.frequency + '</b> vehicles in the <b>' + sizeName + '</b> category by <b>' + params.xName.toLowerCase() + '</b>'
                '</div>';
            }
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
