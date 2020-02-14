var options = {
    container: document.getElementById('myChart'),
    data: [
        { label: 'Android', value: 56.9, satisfaction: 10 },
        { label: 'iOS', value: 22.5, satisfaction: 12 },
        { label: 'BlackBerry', value: 6.8, satisfaction: 9 },
        { label: 'Symbian', value: 8.5, satisfaction: 8 },
        { label: 'Bada', value: 2.6, satisfaction: 7 },
        { label: 'Windows', value: 1.9, satisfaction: 6 }
    ],
    series: [{
        type: 'pie',
        angleKey: 'value',
        labelKey: 'label',
        radiusKey: 'satisfaction'
    }]
};

agCharts.AgChart.create(options);