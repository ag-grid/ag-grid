agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    title: {
        text: 'Average expenditure on coffee'
    },
    subtitle: {
        text: 'per person per week in Krakozhia'
    },
    data: [{
        year: '2015',
        spending: 37
    }, {
        year: '2016',
        spending: 40
    }, {
        year: '2017',
        spending: 42
    }, {
        year: '2018',
        spending: 43
    }],
    series: [{
        xKey: 'year',
        yKey: 'spending'
    }]
});