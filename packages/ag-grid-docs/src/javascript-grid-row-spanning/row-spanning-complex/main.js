var columnDefs = [
    {field: 'localTime'},
    {field: 'show', cellRenderer: 'showCellRenderer',
        rowSpan: function(params) {
            if (params.data.show) {
                return 4;
            } else {
                return 1;
            }
        },
        cellClassRules: {
            'show-cell': 'value !== undefined'
        },
        width: 200
    },
    {field: 'a'},
    {field: 'b'},
    {field: 'c'},
    {field: 'd'},
    {field: 'e'},
];

var rowData = [
    {localTime: '5:00am', show: {name: 'Wake Up Dublin', presenter: 'Andrew Connell'}, a: 0.231, b: 0.523, c: 0.423, d: 0.527, e: 0.342},
    {localTime: '5:15am', a: 0.423, b: 0.452, c: 0.523, d: 0.543, e: 0.452},
    {localTime: '5:30am', a: 0.537, b: 0.246, c: 0.426, d: 0.421, e: 0.523},
    {localTime: '5:45am', a: 0.893, b: 0.083, c: 0.532, d: 0.983, e: 0.543},
    {localTime: '6:00am', show: {name: 'Pure Back In The Day', presenter: 'Kevin Flanagan'}, a: 0.231, b: 0.523, c: 0.423, d: 0.527, e: 0.342},
    {localTime: '6:15am', a: 0.423, b: 0.452, c: 0.523, d: 0.543, e: 0.452},
    {localTime: '6:30am', a: 0.537, b: 0.246, c: 0.426, d: 0.421, e: 0.523},
    {localTime: '6:45am', a: 0.893, b: 0.083, c: 0.532, d: 0.983, e: 0.543},
    {localTime: '7:00am', show: {name: 'The Queens Breakfast', presenter: 'Tony Smith'}, a: 0.231, b: 0.523, c: 0.423, d: 0.527, e: 0.342},
    {localTime: '7:15am', a: 0.423, b: 0.452, c: 0.523, d: 0.543, e: 0.452},
    {localTime: '7:30am', a: 0.537, b: 0.246, c: 0.426, d: 0.421, e: 0.523},
    {localTime: '7:45am', a: 0.893, b: 0.083, c: 0.532, d: 0.983, e: 0.543},
    {localTime: '8:00am', show: {name: 'Cosmetic Surgery', presenter: 'Niall Crosby'}, a: 0.231, b: 0.523, c: 0.423, d: 0.527, e: 0.342},
    {localTime: '8:15am', a: 0.423, b: 0.452, c: 0.523, d: 0.543, e: 0.452},
    {localTime: '8:30am', a: 0.537, b: 0.246, c: 0.426, d: 0.421, e: 0.523},
    {localTime: '8:45am', a: 0.893, b: 0.083, c: 0.532, d: 0.983, e: 0.543},
    {localTime: '8:00am', show: {name: 'Brickfield Park Sessions', presenter: 'Bricker McGee'}, a: 0.231, b: 0.523, c: 0.423, d: 0.527, e: 0.342},
    {localTime: '8:15am', a: 0.423, b: 0.452, c: 0.523, d: 0.543, e: 0.452},
    {localTime: '8:30am', a: 0.537, b: 0.246, c: 0.426, d: 0.421, e: 0.523},
    {localTime: '8:45am', a: 0.893, b: 0.083, c: 0.532, d: 0.983, e: 0.543},
];

var gridOptions = {
    components: {
        showCellRenderer: ShowCellRenderer
    },
    enableColResize: true,
    suppressRowTransform: true,
    columnDefs: columnDefs,
    rowData: rowData,
    defaultColDef: {
        width: 100
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
