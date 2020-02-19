var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Total Visitors to Science Museums (2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Digital, Culture, Media & Sport',
    },
    series: [{
        type: 'area',
        xKey: 'date',
        yKeys: [
            'Science Museum',
            'National Media Museum',
            'National Railway Museum',
            'Locomotion',
            'Museum of Science and Industry, Manchester',
            'National Coal Mining Museum for England',
        ],
        marker: {
            enabled: true,
        }
    }],
    axes: [
        {
            type: 'time',
            position: 'bottom',
            label: {
                format: '%b',
            }
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Total visitors',
            },
            label: {
                formatter: function(params) { return params.value / 1000 + 'k'; },
            },
        }],
    legend: {
        position: 'bottom',
    },
};

var chart = agCharts.AgChart.create(options);
