var options = ['A', 'B', 'C', 'D', 'E'];
var valuesArrayCount = 0;
var valuesArray = [];

function updateValuesArray() {
    valuesArray.length = 0;

    options.forEach(function(o) {
        valuesArray.push(o + valuesArrayCount);
        valuesArray.push(o + (valuesArrayCount + 1));
    });

    valuesArrayCount = (valuesArrayCount + 1) % 10;
}

var valuesCallbackCount = 0;
var valuesCallback = function(params) {
    console.log('Called values callback');

    var values = [];
    options.forEach(function(o) {
        values.push(o + valuesCallbackCount);
        values.push(o + (valuesCallbackCount + 1));
    });

    valuesCallbackCount = (valuesCallbackCount + 1) % 10;

    setTimeout(function() { params.success(values); }, 1000);
};

function getRowData() {
    var rows = [];

    for (var i = 0; i < 2000; i++) {
        var index = Math.floor(Math.random() * 5);
        rows.push({ code: options[index] + i % 10 });
    }

    return rows;
}