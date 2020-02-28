var options = {
    container: document.getElementById('myChart'),
    data: [
        { os: 'Windows', share: 88.07 },
        { os: 'macOS', share: 9.44 },
        { os: 'Linux', share: 1.87 }
    ],
    series: [{
        type: 'column',
        xKey: 'os',
        yKeys: ['share']
    }],
    axes: [{
        type: 'category',
        position: 'bottom',
        title: {
            text: 'Desktop Operating Systems',
            enabled: false
        }
    }, {
        type: 'number',
        position: 'left',
        title: {
            text: 'Market Share (%)',
            enabled: false
        }
    }],
    legend: {
        enabled: false
    }
};

var chart = agCharts.AgChart.create(options);

function showAxisTitles() {
    chart.axes[0].title.enabled = true;
    chart.axes[1].title.enabled = true;
    chart.performLayout();
}

function hideAxisTitles() {
    chart.axes[0].title.enabled = false;
    chart.axes[1].title.enabled = false;
    chart.performLayout();
}