var options = {
    container: document.getElementById('myChart'),
    title: {
        text: "Most Common Girls' First Names In English"
    },
    data: [
        { name: 'Mary', count: 234000 },
        { name: 'Patricia', count: 211000 },
        { name: 'Jennifer', count: 178000 },
        { name: 'Elizabeth', count: 153000 },
        { name: 'Linda', count: 123000 }
    ],
    series: [{
        type: 'column',
        xKey: 'name',
        yKeys: ['count']
    }],
    axes: [{
        type: 'category',
        position: 'bottom'
    }, {
        type: 'number',
        position: 'left'
    }],
    legend: {
        enabled: false
    }
};

var chart = agCharts.AgChart.create(options);

function useGridStyle1() {
}

function useGridStyle2() {
}

function useGridStyle3() {
}