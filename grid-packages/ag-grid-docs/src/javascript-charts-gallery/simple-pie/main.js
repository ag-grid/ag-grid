var options = {
    container: document.querySelector('#myChart'),
    title: {
        text: 'Religions of London Population (2016)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    series: [{
        data: data,
        type: 'pie',
        labelKey: 'religion',
        angleKey: 'population',
        label: {
            minAngle: 0,
        },
        callout: {
            strokeWidth: 2,
        },
    }],
    legend: {
        enabled: false,
    },
};

var chart = agCharts.AgChart.create(options);
