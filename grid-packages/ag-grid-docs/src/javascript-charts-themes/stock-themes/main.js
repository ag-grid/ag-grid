var options = {
    container: document.getElementById('myChart'),
    autoSize: true,
    tooltipTracking: false,
    data: data,
    title: {},
    subtitle: {},
    axes: [{
        type: 'category',
        position: 'bottom',
    }, {
        type: 'number',
        position: 'left'
    }],
    series: [{
        type: 'area',
        xKey: 'name',
        yKeys: ['value7', 'value8']
    }, {
        type: 'column',
        xKey: 'name',
        yKeys: ['value', 'value2']
    }, {
        type: 'scatter',
        xKey: 'name',
        yKey: 'value3'
    }, {
        type: 'line',
        xKey: 'name',
        yKey: 'value4'
    }, {
        type: 'line',
        xKey: 'name',
        yKey: 'value5'
    }, {
        type: 'line',
        xKey: 'name',
        yKey: 'value6'
    }]
};

var chart = agCharts.AgChart.create(options);

function useTheme(theme) {
    chart.theme = theme; // this won't work with Vanilla JS
    // options.theme = theme;
    // agCharts.AgChart.update(chart, options);
}