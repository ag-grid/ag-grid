var options = {
    container: document.getElementById('myChart'),
    theme: {
        baseTheme: 'dark',
        palette: {
            fills: [
                '#5C2983',
                '#0076C5',
                '#21B372',
                '#FDDE02',
                '#F76700',
                '#D30018'
            ],
            strokes: ['black']
        },
        defaults: {
            cartesian: {
                title: {
                    text: 'Get Your Pot Of Gold Theme'
                },
                series: {
                    line: {
                        marker: {
                            size: 16
                        }
                    }
                }
            }
        }
    },
    autoSize: true,
    tooltipTracking: false,
    data: data,
    title: {},
    subtitle: {},
    axes: [{
        type: 'category',
        position: 'bottom',
    }, {
        type: 'number',
        position: 'left'
    }],
    series: [{
        type: 'area',
        xKey: 'name',
        yKeys: ['value7', 'value8']
    }, {
        type: 'column',
        xKey: 'name',
        yKeys: ['value', 'value2']
    }, {
        type: 'scatter',
        xKey: 'name',
        yKey: 'value3'
    }, {
        type: 'line',
        xKey: 'name',
        yKey: 'value4'
    }, {
        type: 'line',
        xKey: 'name',
        yKey: 'value5'
    }, {
        type: 'line',
        xKey: 'name',
        yKey: 'value6'
    }]
};

var chart = agCharts.AgChart.create(options);