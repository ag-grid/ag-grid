var options = {
    container: document.getElementById('myChart'),
    title: {
        text: "Apple's revenue by product category"
    },
    subtitle: {
        text: 'in billion U.S. dollars'
    },
    data: revenueData,
    series: [{
        type: 'column',
        xKey: 'quarter',
        yKeys: ['iphone'],
        yNames: ['iPhone']
    }]
};

agCharts.AgChart.create(options);