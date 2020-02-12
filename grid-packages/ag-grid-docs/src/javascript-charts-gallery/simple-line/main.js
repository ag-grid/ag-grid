var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Road fuel prices',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Business, Energy & Industrial Strategy',
    },
    series: [
        {
            type: 'line',
            xKey: 'date',
            yKey: 'petrol',
            stroke: '#01c185',
            marker: {
                stroke: '#01c185',
                fill: '#01c185',
            }
        },
        {
            type: 'line',
            xKey: 'date',
            yKey: 'diesel',
            stroke: '#000000',
            marker: {
                stroke: '#000000',
                fill: '#000000',
            }
        }
    ],
    axes: [
        {
            position: 'bottom',
            type: 'time',
            tick: {
                count: agCharts.month.every(2),
            },
            title: {
                text: 'Date'
            }
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Price in pence'
            }
        }
    ]
};

var chart = agCharts.AgChart.create(options);
