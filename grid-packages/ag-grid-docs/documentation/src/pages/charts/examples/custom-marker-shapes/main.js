var fills = [
    '#f3622d',
    '#fba71b',
    '#57b757',
    '#41a9c9',
    '#4258c9',
    '#9a42c8',
    '#c84164',
    '#888888'
];

var strokes = [
    '#aa4520',
    '#b07513',
    '#3d803d',
    '#2d768d',
    '#2e3e8d',
    '#6c2e8c',
    '#8c2d46',
    '#5f5f5f'
];

var colourIndex = 0;
var markerSize = 10;

var options = {
    container: document.querySelector('#myChart'),
    autoSize: true,
    data: data,
    title: {
        text: 'Taxed Alcohol Consumption (UK)',
        fontSize: 18,
    },
    subtitle: {
        text: 'Source: HM Revenue & Customs',
    },
    series: [
        {
            type: 'line',
            title: 'Still wine',
            xKey: 'year',
            yKey: 'stillWine',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: 'circle',
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
        {
            type: 'line',
            title: 'Sparkling wine',
            xKey: 'year',
            yKey: 'sparklingWine',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: 'cross',
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
        {
            type: 'line',
            title: 'Made-wine',
            xKey: 'year',
            yKey: 'madeWine',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: 'diamond',
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
        {
            type: 'line',
            title: 'Whisky',
            xKey: 'year',
            yKey: 'whisky',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: 'plus',
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
        {
            type: 'line',
            title: 'Potable spirits',
            xKey: 'year',
            yKey: 'potableSpirits',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: 'square',
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
        {
            type: 'line',
            title: 'Beer',
            xKey: 'year',
            yKey: 'beer',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: 'triangle',
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
        {
            type: 'line',
            title: 'Cider',
            xKey: 'year',
            yKey: 'cider',
            stroke: fills[colourIndex],
            marker: {
                size: markerSize,
                shape: createMarker(),
                fill: fills[colourIndex],
                stroke: strokes[colourIndex++],
            },
        },
    ],
    axes: [
        {
            position: 'bottom',
            type: 'category',
            label: {
                rotation: -30,
            },
        },
        {
            position: 'left',
            type: 'number',
            title: {
                text: 'Volume (hectolitres)'
            },
            label: {
                formatter: function(params) { return params.value / 1000000 + 'M'; },
            },
        }
    ]
};

var chart = agCharts.AgChart.create(options);

function createMarker() {
    // Our examples use vanilla ES5, so we have to use the ES5
    // version of the custom marker class here (please see the
    // ES6 version in the comment at the bottom):
    function Heart() {
        agCharts.Marker.call(this);
    }

    Heart.className = 'Heart';
    Heart.prototype = Object.create(agCharts.Marker.prototype);
    Heart.prototype.constructor = Heart;
    Heart.prototype.updatePath = function updatePath() {
        var path = this.path;
        var x = this.x;
        var r = this.size / 4;
        var y = this.y + r / 2;

        path.clear();
        path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
        path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
        path.lineTo(x, y + r);
        path.closePath();
    };

    return Heart;
}

function rad(degree) {
    return degree / 180 * Math.PI;
}

// ES6 version of the custom marker class:
// class Heart extends agCharts.Marker {
//     static className = 'Heart';
//     rad(degree) {
//         return degree / 180 * Math.PI;
//     }

//     updatePath() {
//         let { x, path, size, rad } = this;
//         const r = size / 4;
//         const y = this.y + r / 2;

//         path.clear();
//         path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
//         path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
//         path.lineTo(x, y + r);
//         path.closePath();
//     }
// }