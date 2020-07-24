var options = {
    container: document.getElementById('myChart'),
    theme: {
        baseTheme: 'dark',
        palette: {
            fills: [
                '#5C2983',
                '#0076C5',
                '#21B372',
                '#FDDE02',
                '#F76700',
                '#D30018'
            ],
            strokes: ['black']
        },
        defaults: {
            cartesian: {
                title: {
                    fontSize: 24
                },
                series: {
                    column: {
                        label: {
                            enabled: true,
                            color: 'black'
                        }
                    }
                }
            }
        }
    },
    autoSize: true,
    padding: {
        left: 70,
        right: 70
    },
    title: {
        enabled: true,
        text: 'Custom Chart Theme Example'
    },
    data: [
        { label: 'Android', v1: 5.67, v2: 8.63, v3: 8.14, v4: 6.45, v5: 1.37 },
        { label: 'iOS', v1: 7.01, v2: 8.04, v3: 1.338, v4: 6.78, v5: 5.45 },
        { label: 'BlackBerry', v1: 7.54, v2: 1.98, v3: 9.88, v4: 1.38, v5: 4.44 },
        { label: 'Symbian', v1: 9.27, v2: 4.21, v3: 2.53, v4: 6.31, v5: 4.44 },
        { label: 'Windows', v1: 2.80, v2: 1.908, v3: 7.48, v4: 5.29, v5: 8.80 }
    ],
    series: [{
        type: 'column',
        xKey: 'label',
        yKeys: ['v1', 'v2', 'v3', 'v4', 'v5'],
        yNames: ['Reliability', 'Ease of use', 'Performance', 'Price', 'Market share']
    }]
};

var chart = agCharts.AgChart.create(options);

function applyTheme(theme) {
    options.theme = theme;
    agCharts.AgChart.update(chart, options);
}