var lastTime = new Date('07 Jan 2020 13:25:00 GMT').getTime();
var data = [];

function getData() {
    data.shift();

    while (data.length < 20) {
        data.push({
            time: new Date(lastTime += 1000),
            voltage: 1.1 + Math.random() / 2
        });
    }

    return data;
}

var options = {
    container: document.getElementById('myChart'),
    data: getData(),
    series: [{
        xKey: 'time',
        yKey: 'voltage',
        tooltipEnabled: false
    }],
    axes: [
        {
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
                    return params.value + 'V';
                }
            }
        }
    ],
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
    this.update();

}

// inScope[update]
function update() {
    chart.data = getData();
}

setInterval(this.update, 500);