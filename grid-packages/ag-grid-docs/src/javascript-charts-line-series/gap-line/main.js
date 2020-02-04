agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    width: 700,
    height: 400,
    data: [{
        year: '2005',
        visitors: 191000
    }, {
        year: '2006',
        visitors: 45000
    }, {
        year: '2007',
        visitors: 100000
    }, {
        year: '2008',
        visitors: null
    }, {
        year: '2009',
        visitors: 78000
    }, {
        year: '2010',
        visitors: 136000
    }, {
        year: '2011',
        visitors: null
    }, {
        year: '2012',
        visitors: 74000
    }, {
        year: '2013',
        visitors: 67000
    }, {
        year: '2014',
        visitors: 74000
    }, {
        year: '2015',
        visitors: 174000
    }, {
        year: '2016',
        visitors: 76000
    }, {
        year: '2017',
        visitors: 56000
    }],
    title: {
        text: 'Visitors to website'
    },
    subtitle: {
        text: '2005-2017'
    },
    series: [{
        xKey: 'year',
        yKey: 'visitors'
    }]
});