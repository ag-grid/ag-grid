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
        tooltipRenderer: function (params) {
            return '<div class="ag-chart-tooltip-title" style="background-color:' + params.color + '">' +
                params.datum[params.xKey] +
            '</div>' +
            '<div class="ag-chart-tooltip-content">' +
                params.datum[params.yKey].toFixed(0) +
            '</div>';
        }
    }]
};

var chart = agCharts.AgChart.create(options);