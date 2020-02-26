var dataIndex = 0;

function getData() {
    var chunkLength = 8;

    if (dataIndex > data.length - chunkLength) {
        dataIndex = 0;
    }

    var chunk = [];

    for (var i = 0; i < chunkLength; i++) {
        chunk.push(data[dataIndex + i]);
    }

    dataIndex++;

    return chunk;
}

var options = {
    container: document.querySelector('#myChart'),
    data: getData(),
    title: {
        text: 'Houses Built in UK',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: Ministry of Housing, Communities & Local Government',
    },
    series: [{
        type: 'area',
        xKey: 'quarter',
        yKeys: ['private', 'housingAssociations', 'localAuthorities'],
        yNames: ['Private enterprise', 'Housing associations', 'Local authorities'],
        fills: [
            '#5BC0EB',
            '#FDE74C',
            '#9BC53D',
            '#E55934',
            '#FA7921',
            '#fa3081'
        ],
        strokes: [
            '#4086a4',
            '#b1a235',
            '#6c8a2b',
            '#a03e24',
            '#af5517',
            '#af225a'
        ],
        marker: {
            enabled: true,
        }
    }],
    axes: [
        {
            type: 'category',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
            title: {
                text: 'Houses built',
            },
        }],
    legend: {
        position: 'bottom',
    },
};

var chart = agCharts.AgChart.create(options);

// inScope[updateData]
function updateData() {
    chart.data = getData();
}

setInterval(this.updateData, 200);