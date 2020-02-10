var data = [{
    beverage: 'Coffee',
    Q1: 450,
    Q2: 560,
    Q3: 600,
    Q4: 700
}, {
    beverage: 'Tea',
    Q1: 270,
    Q2: 380,
    Q3: 450,
    Q4: 520
}, {
    beverage: 'Milk',
    Q1: 180,
    Q2: 170,
    Q3: 190,
    Q4: 200
}];

var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Line Chart'
    },
    subtitle: {
        text: 'per quarter'
    },
    padding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
    },
    series: [{
        type: 'line',
        xKey: 'beverage',
        yKey: 'Q1'
    }],
    legend: {
        spacing: 40
    }
};

var chart = agCharts.AgChart.create(options);
