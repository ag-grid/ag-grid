var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Ethnic Diversity of School Pupils (2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Department for Education',
    },
    series: [{
        type: 'column',
        xKey: 'type',
        yKeys: ['white', 'mixed', 'asian', 'black', 'chinese', 'other'],
        yNames: ['White', 'Mixed', 'Asian', 'Black', 'Chinese', 'Other'],
        normalizedTo: 100,
        fills: [
            '#f1c40f',
            '#e67e22',
            '#2ecc71',
            '#3498db',
            '#9b59b6',
            '#34495e',
        ],
        strokes: [
            '#f39c12',
            '#d35400',
            '#27ae60',
            '#2980b9',
            '#8e44ad',
            '#2c3e50',
        ]
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
                formatter: function(params) { return params.value + '%'; }
            }
        }],
};

var chart = agCharts.AgChart.create(options);
