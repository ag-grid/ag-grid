var columnDefs = [
    // this column uses min and max func
    {headerName: "minMax(age)", field: "age", width: 90, aggFunc: minAndMaxAggFunction},
    // here we use an average func and specify the function directly
    {headerName: "avg(age)", field: "age", width: 90, aggFunc: avgAggFunction, enableValue: true},
    // here we use a custom sum function that was registered with the grid,
    // which overrides the built in sum function
    {headerName: "sum(gold)", field: "gold", width: 100, aggFunc: 'sum', enableValue: true},
    // and these two use the built in sum func
    {headerName: "abc(silver)", field: "silver", width: 100, aggFunc: '123', enableValue: true},
    {headerName: "xyz(bronze)", field: "bronze", width: 100, aggFunc: 'xyz', enableValue: true},

    { field: "country", rowGroup: true, hide: true},
    { field: "year", rowGroup: true, hide: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupUseEntireRow: false,
    enableSorting: true,
    enableColResize: true,
    enableRangeSelection: true,
    autoGroupColumnDef: {
        headerName: "Athlete", field: "athlete", width: 200
    },
    suppressAggFuncInHeader: true,
    aggFuncs: {
        // this overrides the grids built in sum function
        'sum': sumFunction,
        // this adds another function called 'abc'
        '123': oneTwoThreeFunc,
        // and again xyz
        'xyz': xyzFunc
    },
    sideBar: true,
    onGridReady: function(params) {
        // we could also register functions after the grid is created,
        // however because we are providing the columns in the grid options,
        // it will be to late (eg remove 'xyz' from aggFuncs, and you will
        // see the grid complains.
        params.api.addAggFunc('xyz', xyzFunc);

        // this has nothing to do with aggregation, just get cols to fit width
        gridOptions.api.sizeColumnsToFit();
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
}

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
        max: null,
        // because we are returning back an object, this would get rendered as [Object,Object]
        // in the browser. we could get around this by providing a cellFormatter, OR we could
        // get around it in a customer cellRenderer, however this is a trick that will also work
        // with clipboard.
        toString: function() {
            return '(' + this.min + '..'+ this.max + ')';
        }
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
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then( function(data) {
            gridOptions.api.setRowData(data);
        });
});
