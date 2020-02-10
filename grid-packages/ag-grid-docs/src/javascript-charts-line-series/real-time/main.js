var lastTime = new Date('07 Jan 2020 13:25:00 GMT').getTime();
var data = [];
for (var i = 0; i < 20; i++) {
    data.push({
        time: new Date(lastTime += 1000),
        voltage: 1.1 + Math.random() / 2
    });
}

var chart = agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    data: data,
    series: [{
        xKey: 'time',
        yKey: 'voltage',
        tooltipEnabled: false
    }],
    axes: [{
        type: 'time',
        position: 'bottom',
        tick: {
            count: agCharts.second.every(5)
        },
        label: {
            format: '%H:%M:%S'
        }
    }, {
        type: 'number',
        position: 'left',
        label: {
            formatter: function (params) {
                return params.value + 'v';
            }
        }
    }],
    title: {
        text: 'Core Voltage'
    },
    legend: {
        enabled: false
    }
});

setInterval(function () {
    data.shift();
    data.push({
        time: new Date(lastTime += 1000),
        voltage: 1.1 + Math.random() / 2
    });
    chart.data = data;
}, 1000);