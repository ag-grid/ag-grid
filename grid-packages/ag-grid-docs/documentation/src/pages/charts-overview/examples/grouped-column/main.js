var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Regular Internet Users',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Office for National Statistics',
    },
    series: [{
        type: 'column',
        xKey: 'year',
        yKeys: ['16-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+'],
        grouped: true,
    }],
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            label: {
                formatter: function(params) { return params.value / 1000 + 'M'; }
            }
        }],
};

var chart = agCharts.AgChart.create(options);
