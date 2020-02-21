var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Fuel Spending (2019)'
    },
    data: [{
        quarter: 'Q1',
        gas: 200,
        diesel: 100
    }, {
        quarter: 'Q2',
        gas: 300,
        diesel: 130
    }, {
        quarter: 'Q3',
        gas: 350,
        diesel: 160
    }, {
        quarter: 'Q4',
        gas: 400,
        diesel: 200
    }],
    series: [{
        xKey: 'quarter',
        yKey: 'gas',
        yName: 'Gas'
    }, {
        xKey: 'quarter',
        yKey: 'diesel',
        yName: 'Diesel'
    }]
};

agCharts.AgChart.create(options);