var data = [
    {
        beverage: 'Coffee',
        Q1: 450,
        Q2: 560,
        Q3: 600,
        Q4: 700
    },
    {
        beverage: 'Tea',
        Q1: 270,
        Q2: 380,
        Q3: 450,
        Q4: 520
    },
    {
        beverage: 'Milk',
        Q1: 180,
        Q2: 170,
        Q3: 190,
        Q4: 200
    },
];

var options = {
    data: data,
    container: document.body,
    title: {
        text: 'Beverage Expenses'
    },
    subtitle: {
        text: 'per quarter'
    },
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
        highlightStyle: {
            fill: 'cyan',    // series item fill
            stroke: 'blue',  // series item stroke
            series: {
                dimOpacity: 0.2  // whole series opacity when dimmed (other series is hovered)
            }
        }
    }]
};

agCharts.AgChart.create(options);