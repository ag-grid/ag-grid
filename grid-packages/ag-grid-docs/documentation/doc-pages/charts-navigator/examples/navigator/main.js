var options = {
    container: document.getElementById('myChart'),
    title: {
        text: 'Try dragging the Navigator\'s handles to zoom in'
    },
    subtitle: {
        text: 'or the area between them to pan around'
    },
    data: [
        { label: 'Android', value: 56.9 },
        { label: 'iOS', value: 22.5 },
        { label: 'BlackBerry', value: 6.8 },
        { label: 'Symbian', value: 8.5 },
        { label: 'Bada', value: 2.6 },
        { label: 'Windows', value: 1.9 }
    ],
    series: [{
        type: 'column',
        xKey: 'label',
        yKeys: ['value']
    }],
    axes: [{
        type: 'number',
        position: 'left'
    }, {
        type: 'category',
        position: 'bottom'
    }],
    legend: {
        enabled: false
    },
    navigator: {
        enabled: true
    }
};

var chart = agCharts.AgChart.create(options);

function toggleEnabled(value) {
    options.navigator.enabled = value;
    agCharts.AgChart.update(chart, options);
}