agCharts.AgChart.create({
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
});