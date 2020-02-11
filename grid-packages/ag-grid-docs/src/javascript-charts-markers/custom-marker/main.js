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
function rad(degree) {
    return degree / 180 * Math.PI;
}

agCharts.AgChart.create({
    container: document.getElementById('myChart'),
    title: {
        text: 'Fuel Spending (2019)'
    },
    data: [{
        quarter: 'Q1',
        electric: 50
    }, {
        quarter: 'Q2',
        electric: 70
    }, {
        quarter: 'Q3',
        electric: 60
    }, {
        quarter: 'Q4',
        electric: 40
    }],
    series: [{
        xKey: 'quarter',
        yKey: 'electric',
        title: 'Electric',
        marker: {
            shape: Heart,
            size: 16
        }
    }],
    legend: {
        position: 'bottom'
    }
});

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