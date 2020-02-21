var options = {
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
            count: agCharts.time.second.every(5)
        },
        label: {
            format: '%H:%M:%S'
        }
    }, {
        type: 'number',
        position: 'left',
        label: {
            formatter: function(params) {
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
};

var chart = agCharts.AgChart.create(options);

var updating = false;
function startUpdates() {
    if (updating) {
        return;
    }
    updating = true;
    setInterval(update, 1000);
}

function update() {
    data.shift();
    data.push({
        time: new Date(lastTime += 1000),
        voltage: 1.1 + Math.random() / 2
    });
    chart.data = data;
}