var options = {
    container: document.getElementById('myChart'),
    data: [{
        month: 'Jun',
        sweaters: 50
    }, {
        month: 'Jul',
        sweaters: 70
    }, {
        month: 'Aug',
        sweaters: 60
    }],
    series: [{
        type: 'column',
        xKey: 'month',
        yKeys: ['sweaters'],
        yNames: ['Sweaters Made']
    }],
    tooltipClass: 'my-tooltip'
};

var chart = agCharts.AgChart.create(options);