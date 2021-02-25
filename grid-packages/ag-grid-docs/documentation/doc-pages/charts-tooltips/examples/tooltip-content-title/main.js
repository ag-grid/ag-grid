var options = {
    container: document.getElementById('myChart'),
    data: [{
        month: 'Dec',
        sweaters: 50,
        hats: 40
    }, {
        month: 'Jan',
        sweaters: 70,
        hats: 50
    }, {
        month: 'Feb',
        sweaters: 60,
        hats: 30
    }],
    series: [{
        type: 'column',
        xKey: 'month',
        yKeys: ['sweaters', 'hats'],
        yNames: ['Sweaters made', 'Hats made'],
        tooltip: {
            renderer: function (params) {
                return {
                    title: params.xValue,
                    content: params.yValue.toFixed(0)
                };
            }
        }
    }]
};

var chart = agCharts.AgChart.create(options);