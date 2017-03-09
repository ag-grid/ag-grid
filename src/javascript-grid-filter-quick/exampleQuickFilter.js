var columnDefs = [
    // simple column, easy to understand
    {headerName: "A", field: "a"},
    // the grid works with embedded fields
    {headerName: "B", field: "b.name"},
    // or use value getter, all works with quick filter
    {headerName: "C", valueGetter: "'zz' + data.c.name"},
    // or use the object value, so value passed around is an object
    {headerName: "D", field: "d",
        cellRenderer: function(params) {
            return '<b>'+params.value.name+'</b>';
        },
        // this is needed to avoid toString=[object,object] result with objects
        getQuickFilterText: function(params) {
            return params.value.name;
        }
    },
    // this fails filter - it's working with a complex object, so the quick filter
    // text gets [object,object]
    {headerName: "E", field: "e",
        cellRenderer: function(params) {
            return '<b>'+params.value.name+'</b>';
        }
    }
];

var rowData = [];
for (var i = 0; i<100; i++) {
    // create sample row item
    var rowItem = {
        // is is simple
        a: 'aa' + Math.floor(Math.random()*10000),
        // but b, c, d and e are all complex objects
        b: {
            name: 'bb' + Math.floor(Math.random()*10000)
        },
        c: {
            name: 'cc' + Math.floor(Math.random()*10000)
        },
        d: {
            name: 'dd' + Math.floor(Math.random()*10000)
        },
        e: {
            name: 'ee' + Math.floor(Math.random()*10000)
        }
    };
    rowData.push(rowItem);
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
};

function onFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
}

function onPrintQuickFilterTexts() {
    gridOptions.api.forEachNode(function(rowNode, index) {
        console.log('Row ' + index + ' quick filter text is ' + rowNode.quickFilterAggregateText);
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
