var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Worldwide earthquakes in January 2019',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: US Geological Survey',
    },
    series: [
        {
            type: 'scatter',
            xKey: 'depth',
            xName: 'Depth',
            yKey: 'magnitude',
            yName: 'Magnitude',
            sizeKey: 'minimumDistance',
            sizeName: 'Minimum Distance',
            marker: {
                size: 100,
                minSize: 5,
            },
            fill: '#41874b',
            stroke: '#41874b',
            fillOpacity: 0.5,
        }
    ],
    axes: [
        {
            position: 'bottom',
            type: 'number',
            title: {
                text: 'Depth (m)'
            },
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Magnitude'
            }
        }
    ],
    legend: {
        enabled: false,
    }
};

var chart = agCharts.AgChart.create(options);
