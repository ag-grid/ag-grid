var options = {
    container: document.getElementById('myChart'),
    data: [{
        month: 'Jun',
        value1: 50,
        hats_made: 40
    }, {
        month: 'Jul',
        value1: 70,
        hats_made: 50
    }, {
        month: 'Aug',
        value1: 60,
        hats_made: 30
    }],
    axes: [{
        type: 'number',
        position: 'left',
        label: {
            format: '#{.0f} units',
            formatter: params => '(' + Math.round(params.value) + ')'
        }
    }, {
        type: 'category',
        position: 'bottom'
    }],
    series: [{
        type: 'column',
        xKey: 'month',
        yKeys: ['value1', 'hats_made'],
        yNames: ['Sweaters Made', 'Hats Made']
    }]
};

var chart = agCharts.AgChart.create(options);