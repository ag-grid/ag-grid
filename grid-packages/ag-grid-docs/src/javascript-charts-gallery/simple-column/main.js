var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Total Visitors to Museums and Galleries',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Digital, Culture, Media & Sport',
    },
    series: [{
        type: 'column',
        xKey: 'year',
        yKeys: ['visitors'],
        shadow: {
            enabled: true,
            xOffset: 3,
        }
    }],
    axes: [
        {
            type: 'category',
            position: 'bottom',
            title: {
                text: 'Year',
            }
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Total visitors',
            },
            label: {
                formatter: function(params) { return params.value / 1000000 + 'm'; },
            },
        }],
    legend: {
        enabled: false,
    },
};

var chart = agCharts.AgChart.create(options);
