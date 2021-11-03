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
            angleKey: '2018/19',
            label: {
                enabled: false,
            },
            title: {
                text: '2018/19',
                showInLegend: true,
            },
            innerRadiusOffset: -40
        },
        {
            type: 'pie',
            labelKey: 'type',
            angleKey: '2017/18',
            label: {
                enabled: false,
            },
            title: {
                text: '2017/18',
                showInLegend: true,
            },
            outerRadiusOffset: -70,
            innerRadiusOffset: -110
        },
        {
            type: 'pie',
            labelKey: 'type',
            angleKey: '2016/17',
            label: {
                enabled: false,
            },
            title: {
                text: '2016/17',
                showInLegend: true,
            },
            outerRadiusOffset: -140,
            innerRadiusOffset: -180
        }
    ],
};

var chart = agCharts.AgChart.create(options);
