var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 200,
        comparator: agGrid.defaultGroupComparator,
        cellRenderer: 'group'
    },
    // this column uses min and max func
    {headerName: "minMax(age)", field: "age", width: 90, cellRenderer: ageRenderer, aggFunc: minAndMaxAggFunction},
    // here we use an average func and specify the fucntion directly
    {headerName: "avg(age)", field: "age", width: 90, aggFunc: avgAggFunction},
    // here we use a custom sum function that was registered with the grid,
    // which overrides the built in sum function
    {headerName: "sum(gold)", field: "gold", width: 100, aggFunc: 'sum', enableValue: true},
    // and these two use the built in sum func
    {headerName: "abc(silver)", field: "silver", width: 100, aggFunc: '123', enableValue: true},
    {headerName: "xyz(bronze)", field: "bronze", width: 100, aggFunc: 'xyz', enableValue: true},
    {headerName: "Country", field: "country", width: 120, rowGroupIndex: 0, hide: true},
    {headerName: "Year", field: "year", width: 90, rowGroupIndex: 1, hide: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupUseEntireRow: false,
    enableSorting: true,
    enableColResize: true,
    groupSuppressAutoColumn: true,
    suppressAggFuncInHeader: true,
    aggFuncs: {
        // this overrides the grids built in sum function
        'sum': sumFunction,
        // this adds another function called 'abc'
        '123': oneTwoThreeFunc,
        // and again xyz
        'xyz': xyzFunc
    },
    onGridReady: function(params) {
        // we could also register functions after the grid is created,
        // however because we are providing the columns in the gridOptions,
        // it will be to late (eg remove 'xyz' from aggFuncs, and you will
        // see the grid complains.
        params.api.addAggFunc('xyz', xyzFunc);

        // this has nothing to do with aggregation, just get cols to fit width
        gridOptions.api.sizeColumnsToFit();
    }
};

function oneTwoThreeFunc(nodes) {
    // this is just an example, rather than working out an aggregation,
    // we just return 123 each time, so you can see in the example 22 is the result
    return 123;
}

function xyzFunc(nodes) {
    // this is just an example, rather than working out an aggregation,
    // we just return 22 each time, so you can see in the example 22 is the result
    return 'xyz';
}

// age renderer prints min and max when a group, or just the value when a leaf node
function ageRenderer(params) {
    if (params.node.group) {
        return '(' + params.data.age.min + '..' + params.data.age.max + ')';
    } else {
        return params.value;
    }
}

// sum function has no advantage over the built in sum function.
// it's shown here as it's the simplest form of aggregation and
// showing it can be good as a starting point for understanding
// hwo the aggregation functions work.
function sumFunction(values) {
    var result = 0;
    values.forEach( function(value) {
        if (typeof value === 'number') {
            result += value;
        }
    });
    return result;
}

// min and max agg function. the leaf nodes are just numbers, like any other
// value. however the function returns an object with min and max, thus the group
// nodes all have these objects.
function minAndMaxAggFunction(values) {
    // this is what we will return
    var result = {
        min: null,
        max: null
    };
    // update the result based on each value
    values.forEach( function(value) {

        var groupNode = value !== null && value!== undefined && typeof value === 'object';

        var minValue = groupNode ? value.min : value;
        var maxValue = groupNode ? value.max : value;

        // value is a number, not a 'result' object,
        // so this must be the first group
        result.min = min(minValue, result.min);
        result.max = max(maxValue, result.max);
    });

    return result;
}

// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function avgAggFunction(values) {

    // the average will be the sum / count
    var sum = 0;
    var count = 0;

    values.forEach( function(value) {
        var groupNode = value !== null && value!== undefined && typeof value === 'object';
        if (groupNode) {
            // we are aggregating groups, so we take the
            // aggregated values to calculated a weighted average
            sum += value.avg * value.count;
            count += value.count;
        } else {
            // skip values that are not numbers (ie skip empty values)
            if (typeof value === 'number') {
                sum += value;
                count++;
            }
        }
    });

    // avoid divide by zero error
    if (count!==0) {
        var avg = sum / count;
    } else {
        avg = null;
    }

    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    var result = {
        count: count,
        avg: avg,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function() {
            return this.avg;
        }
    };

    return result;
}

// similar to Math.min() except handles missing values, if any value is missing, then
// it returns the other value, or 'null' if both are missing.
function min(a, b) {
    var aMissing = typeof a !== 'number';
    var bMissing = typeof b !== 'number';

    if (aMissing && bMissing) {
        return null;
    } else if (aMissing) {
        return b;
    } else if (bMissing) {
        return a;
    } else if (a > b) {
        return b;
    } else {
        return a;
    }
}

// similar to Math.max() except handles missing values, if any value is missing, then
// it returns the other value, or 'null' if both are missing.
function max(a, b) {
    var aMissing = typeof a !== 'number';
    var bMissing = typeof b !== 'number';

    if (aMissing && bMissing) {
        return null;
    } else if (aMissing) {
        return b;
    } else if (bMissing) {
        return a;
    } else if (a < b) {
        return b;
    } else {
        return a;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});