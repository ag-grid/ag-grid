var options = {
    container: document.getElementById('myChart'),
    data: [
        { os: 'Android', share: 56.9, satisfaction: 10 },
        { os: 'iOS', share: 22.5, satisfaction: 15 },
        { os: 'BlackBerry', share: 6.8, satisfaction: 5 },
        { os: 'Symbian', share: 8.5, satisfaction: 1 },
        { os: 'Bada', share: 2.6, satisfaction: 2 },
        { os: 'Windows', share: 1.9, satisfaction: 12 }
    ],
    series: [{
        type: 'pie',
        title: {
            text: 'Market Share'
        },
        labelKey: 'os',
        angleKey: 'share',
        innerRadiusOffset: -40
    }, {
        type: 'pie',
        title: {
            text: 'Satisfaction'
        },
        labelKey: 'os',
        angleKey: 'satisfaction',
        outerRadiusOffset: -100,
        innerRadiusOffset: -140
    }]
};

agCharts.AgChart.create(options);