var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Average Station Entries: Victoria Line (2010)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Transport for London',
    },
    series: [{
        type: 'column',
        xKey: 'station',
        yKeys: ['early', 'morningPeak', 'interPeak', 'afternoonPeak', 'evening'],
        yNames: ['Early', 'Morning peak', 'Between peak', 'Afternoon peak', 'Evening'],
        fills: [
            '#5BC0EB',
            '#FDE74C',
            '#9BC53D',
            '#E55934',
            '#FA7921',
        ],
        strokes: [
            '#4086a4',
            '#b1a235',
            '#6c8a2b',
            '#a03e24',
            '#af5517',
        ]
    }],
    axes: [
        {
            type: 'category',
            position: 'bottom',
            label: {
                rotation: 30,
            },
        },
        {
            type: 'number',
            position: 'left',
            label: {
                formatter: function(params) { return params.value / 1000 + 'k'; },
            },
        }],
    legend: {
        spacing: 40,
        position: 'bottom',
    }
};

var chart = agCharts.AgChart.create(options);
