agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    title: {
        text: "Apple's revenue by product category"
    },
    data: revenueData,
    series: [{
        type: 'column',
        xKey: 'quarter',
        yKeys: ['iphone', 'mac', 'ipad', 'wearables', 'services'],
        yNames: ['iPhone', 'Mac', 'iPad', 'Wearables', 'Services'],
        normalizedTo: 100
    }],
    axes: [{
        type: 'number',
        position: 'left',
        label: {
            formatter: function (params) {
                return params.value + '%';
            }
        }
    }, {
        type: 'category',
        position: 'bottom'
    }]
});