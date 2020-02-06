agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    width: 700,
    height: 400,
    data: [{
        year: '2008',
        visitors: 191000
    }, {
        year: '2009',
        visitors: 45000
    }, {
        year: '2010',
        visitors: 100000
    }, {
        year: '2011',
        visitors: null
    }, {
        year: '2012',
        visitors: 78000
    }, {
        year: '2013',
        visitors: 136000
    }, {
        year: '2014',
        visitors: null
    }, {
        year: '2015',
        visitors: NaN
    }, {
        year: '2016',
        visitors: 67000
    }, {
        year: '2017',
        visitors: Infinity
    }, {
        year: '2018',
        visitors: 174000
    }, {
        year: '2019',
        visitors: 76000
    }, {
        year: '2020',
        visitors: 56000
    }],
    title: {
        text: 'People Born'
    },
    subtitle: {
        text: '2008-2020'
    },
    series: [{
        xKey: 'year',
        yKey: 'visitors'
    }],
    legend: {
        enabled: false
    }
});