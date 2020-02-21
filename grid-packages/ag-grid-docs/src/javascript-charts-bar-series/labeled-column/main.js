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
        yKeys: ['iphone', 'mac', 'ipad', 'wearables', 'services'],
        yNames: ['iPhone', 'Mac', 'iPad', 'Wearables', 'Services'],
        label: {
            formatter: function (params) {
                if (params.value !== undefined) {
                    return params.value.toFixed(0);
                }
                return '';
            }
        }
    }]
};

agCharts.AgChart.create(options);