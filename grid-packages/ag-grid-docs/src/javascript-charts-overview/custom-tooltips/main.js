var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'WEEE Collected in UK (2019)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Environmental Agency',
    },
    tooltipOffset: [30, 0],
    tooltipClass: 'my-tooltip',
    series: [{
        type: 'column',
        xKey: 'quarter',
        yKeys: [
            'largeHousehold', 'smallHousehold', 'itTelecomms', 'consumer', 'tools', 'displays', 'cooling', 'gasLampsLed',
        ],
        yNames: [
            'Large household appliances',
            'Small household appliances',
            'IT and telecomms equipment',
            'Consumer equipment',
            'Electrical and electronic tools',
            'Display equipment',
            'Cooling appliances containing refrigerants',
            'Gas discharge lamps and LED light sources',
        ],
        tooltipRenderer: function(params) {
            var formatThousands = function(value) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            };

            var tooltipHtml = [
                '<div class="my-tooltip">',
                '<span class="my-tooltip__title" style="color: ' + params.color + '">' + params.yName,
                '(' + params.datum[params.xKey] + '):</span> ' + formatThousands(params.datum[params.yKey]) + ' tonnes',
                '</div>'
            ];

            return tooltipHtml.join('\n');
        }
    }],
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Waste collected (tonnes)',
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
