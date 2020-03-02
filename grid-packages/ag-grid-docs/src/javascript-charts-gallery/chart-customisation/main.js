var options = {
    container: document.querySelector('#myChart'),
    data: data,
    background: {
        fill: '#ecf2f9',
    },
    padding: {
        top: 10,
        bottom: 30,
        left: 10,
        right: 10,
    },
    title: {
        text: 'Marriage Statistics (Northern Ireland)',
        fontFamily: 'Georgia, Times New Roman, Times, Serif',
        fontSize: 22,
        color: '#162c53',
    },
    subtitle: {
        text: 'Source: Northern Ireland Statistics and Research Agency',
        fontSize: 10,
        color: '#3f7cbf',
        fontStyle: 'italic',
    },
    series: [
        {
            type: 'line',
            xKey: 'year',
            yKey: 'marriages',
            yName: 'Marriages',
            stroke: '#3d7ab0',
            strokeWidth: 5,
            marker: {
                enabled: false,
                fill: '#3d7ab0',
            }
        },
        {
            type: 'line',
            xKey: 'year',
            yKey: 'civilPartnerships',
            yName: 'Civil partnerships',
            stroke: '#b03d65',
            strokeWidth: 5,
            marker: {
                enabled: false,
                fill: '#b03d65',
            }
        },
        {
            type: 'line',
            xKey: 'year',
            yKey: 'divorces',
            yName: 'Divorces',
            stroke: '#80b03d',
            strokeWidth: 5,
            marker: {
                enabled: false,
                fill: '#80b03d',
            }
        },
    ],
    axes: [
        {
            position: 'top',
            type: 'time',
            tick: {
                count: agCharts.time.year.every(10),
                width: 3,
                color: '#3f7cbf',
            },
            nice: false,
            label: {
                rotation: -30,
                color: '#3f7cbf',
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Impact, Charcoal, Sans-Serif',
            },
            line: {
                color: '#3f7cbf',
            },
            gridStyle: [
                { stroke: '#c1d832', lineDash: [6, 3] },
                { stroke: '#162c53', lineDash: [10, 5] },
            ]
        },
        {
            position: 'right',
            type: 'number',
            tick: {
                count: 20,
                size: 10,
            },
            nice: false,
            label: {
                color: '#3f7cbf',
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Impact, Charcoal, Sans-Serif',
                formatter: function(params) {
                    return params.index % 2 === 1 ? params.value / 1000 + 'k' : '';
                }
            },
            title: {
                text: 'Total number',
                color: '#162c53',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: 16,
                fontFamily: 'Georgia, Times New Roman, Times, Serif',
            },
            line: {
                color: '#326baf',
            }
        }
    ],
    legend: {
        position: 'bottom',
        strokeWidth: 0,
        spacing: 10,
        layoutHorizontalSpacing: 40,
        itemSpacing: 10,
        markerShape: 'diamond',
        markerSize: 20,
        color: '#3f7cbf',
        fontWeight: 600,
        fontSize: 14,
        fontFamily: 'Georgia, Times New Roman, Times, Serif',
    }
};

var chart = agCharts.AgChart.create(options);
