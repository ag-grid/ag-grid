agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    data: generateSpiralData(),
    width: 450,
    height: 450,
    series: [{
        xKey: 'x',
        yKey: 'y'
    }],
    axes: [{
        type: 'number',
        position: 'left'
    }, {
        type: 'number',
        position: 'bottom'
    }],
    legend: {
        enabled: false
    }
});

function generateSpiralData() {
    // r = a + bθ
    // x = r * Math.cos(θ)
    // y = r * Math.sin(θ)
    const a = 1;
    const b = 1;
    const data = [];
    const step = 0.1;
    for (let th = 1; th < 50; th += step) {
        const r = (a + b * th);
        data.push({
            x: r * Math.cos(th),
            y: r * Math.sin(th)
        });
    }
    return data;
}