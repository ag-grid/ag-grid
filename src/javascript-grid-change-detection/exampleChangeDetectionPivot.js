var columnDefs = [
    {headerName: 'Student ID', field: 'student'},
    {headerName: 'Year Group', field: 'yearGroup', rowGroup: true},
    {headerName: 'Age', field: 'age'},
    {headerName: 'Course', field: 'course', pivot: true},
    {headerName: 'Age Range', field: 'ageRange', valueGetter: ageRangeValueGetter, pivot: true},
    {headerName: 'Score', field: 'score', aggFunc: 'avg'}
];

function ageRangeValueGetter(params) {
    var age = params.getValue('age');
    if (age===undefined) { return null; }
    if (age < 20) {
        return '< 20';
    } else if (age > 30) {
        return '> 30';
    } else {
        return '20 to 30';
    }
}

var rowData = [];
for (var i = 1; i<=100; i++) {
    var seed = i * 16807 % 2147483647;
    rowData.push({
        student: 10023 + i,
        score: (seed % 60) + 40,
        course: ['Science', 'History'][(seed % 3 === 0) ? 0 : 1],
        yearGroup: 'Year ' + ((seed % 4) + 1), // 'Year 1' to 'Year 4'
        age: (seed % 25) + 15 // 15 to 40
    });
}

function pivotMode(value) {
    if (value) {
        gridOptions.columnApi.setPivotMode(true);
        gridOptions.columnApi.setRowGroupColumns(['yearGroup']);
        gridOptions.columnApi.setPivotColumns(['course','ageRange']);
    } else {
        gridOptions.columnApi.setPivotMode(false);
        gridOptions.columnApi.setRowGroupColumns([]);
        gridOptions.columnApi.setPivotColumns([]);
    }
}

var gridOptions = {
    defaultColumnDef: {
        valueFormatter: function(params) {
            return params.value;
        }
    },
    columnDefs: columnDefs,
    rowData: rowData,
    pivotMode: true,
    groupDefaultExpanded: 1,
    enableCellChangeFlash: true,
    animateRows: true,
    enableSorting: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
