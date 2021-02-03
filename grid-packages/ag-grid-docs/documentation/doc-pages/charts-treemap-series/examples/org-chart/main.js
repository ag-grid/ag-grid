agCharts.AgChart.create({
    type: 'hierarchy',
    container: document.getElementById('myChart'),
    autoSize: true,
    data,
    series: [{
        type: 'treemap',
        labelKey: 'orgHierarchy',
        colorParents: true,
        gradient: false,
        nodePadding: 3,
        valueDomain: [0, 2, 4],
        valueRange: ['#d73027', '#fee08b', '#1a9850'],
        sizeKey: undefined,
        valueKey: undefined, // if undefined, depth will be used an the value, where root has 0 depth
    }],
    title: {
        text: 'Organizational Chart'
    },
    subtitle: {
        text: 'of yet another big company'
    }
});