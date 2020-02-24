var options = {
    container: document.getElementById('myChart'),
    data: [{
        month: 'Jun',
        value1: 50,
        aama_value: 40
    }, {
        month: 'Jul',
        value1: 70,
        aama_value: 50
    }, {
        month: 'Aug',
        value1: 60,
        aama_value: 30
    }],
    series: [{
        type: 'column',
        xKey: 'month',
        yKeys: ['value1'],
        yNames: ['Sweaters Made']
    }],
    tooltipClass: 'my-tooltip'
};

var chart = agCharts.AgChart.create(options);