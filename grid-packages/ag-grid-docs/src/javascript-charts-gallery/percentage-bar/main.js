var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Internet Users by Geographical Location (2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    series: [{
        type: 'bar',
        xKey: 'area',
        yKeys: ['usedInLast3Months', 'usedOver3MonthsAgo', 'neverUsed'],
        yNames: ['Used in last 3 months', 'Used over 3 months ago', 'Never used'],
        fills: ['#00c851', '#ffbb33', '#ff4444'],
        strokes: ['#006428', '#996500', '#a10000'],
        normalizedTo: 100,
    }],
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
            label: {
                formatter: function(params) { return params.value + '%'; }
            }
        }
    ],
};

var chart = agCharts.AgChart.create(options);