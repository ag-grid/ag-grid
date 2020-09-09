var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Gross Weekly Earnings by Occupation (Q4 2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    series: [{
        type: 'bar',
        xKey: 'type',
        yKeys: ['earnings'],
    }],
    axes: [
        {
            type: 'category',
            position: 'left',
        },
        {
            type: 'number',
            position: 'bottom',
            title: {
                text: '£/week'
            }
        }
    ],
    legend: {
        enabled: false,
    },
};

var chart = agCharts.AgChart.create(options);