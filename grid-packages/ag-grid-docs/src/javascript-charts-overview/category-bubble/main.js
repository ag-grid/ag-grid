var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Punch Card of Github',
        fontSize: 18,
    },
    series: [
        {
            type: 'scatter',
            xKey: 'hour',
            xName: 'Time',
            yKey: 'day',
            yName: 'Day',
            sizeKey: 'size',
            sizeName: 'Commits',
            title: 'Punch Card',
            marker: {
                size: 30,
                minSize: 0,
            },
            fill: '#cc5b58',
            stroke: 'rgba(0,0,0,0)',
            fillOpacity: 0.85,
        }
    ],
    axes: [
        {
            position: 'bottom',
            type: 'category',
            gridStyle: [{
                stroke: 'rgba(0,0,0,0.2)',
                lineDash: [0, 5, 0]
            }],
            tick: {
                color: 'black'
            },
            line: {
                color: undefined
            }
        },
        {
            position: 'left',
            type: 'category',
            gridStyle: [],
            tick: {
                color: 'black'
            },
            line: {
                color: undefined
            }
        }
    ],
    legend: {
        enabled: false,
    }
};

var chart = agCharts.AgChart.create(options);
