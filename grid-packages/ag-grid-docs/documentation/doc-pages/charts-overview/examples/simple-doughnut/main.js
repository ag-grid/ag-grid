var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Dwelling Fires (UK)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Home Office',
    },
    series: [
        {
            type: 'pie',
            labelKey: 'type',
            fillOpacity: 0.9,
            strokeWidth: 0,
            angleKey: '2018/19',
            label: {
                enabled: false,
            },
            title: {
                text: '2018/19',
            },
            innerRadiusOffset: -100
        }
    ],
};

var chart = agCharts.AgChart.create(options);
