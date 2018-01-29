var cellClassRules = {
    'header-cell': 'data.section === "big-title"',
    'quarters-cell': 'data.section === "quarters"'
};

var columnDefs = [
    {headerName: "Jan", field: "jan",
        colSpan: function(params) {
            if (isHeaderRow(params)) {
                return 6;
            } else if (isQuarterRow(params)) {
                return 3;
            } else {
                return 1;
            }
        },
        cellClassRules: cellClassRules
    },
    {headerName: "Feb", field: "feb"},
    {headerName: "Mar", field: "mar"},
    {headerName: "Apr", field: "apr",
        colSpan: function(params) {
            if (isQuarterRow(params)) {
                return 3;
            } else {
                return 1;
            }
        },
        cellClassRules: cellClassRules
    },
    {headerName: "May", field: "may"},
    {headerName: "Jun", field: "jun"}
];

function isHeaderRow(params) {
    return params.data.section === 'big-title';
}

function isQuarterRow(params) {
    return params.data.section === 'quarters';
}

var rowData = [
    {section: 'big-title', jan: 'Warehouse 1'},
    {section: 'quarters', jan: 'Q1', apr: 'Q2'},
    {jan: 534, feb: 612, mar: 243, apr: 231, may: 428, jun: 231},
    {jan: 765, feb: 146, mar: 243, apr: 231, may: 428, jun: 231},
    {jan: 335, feb: 122, mar: 243, apr: 231, may: 428, jun: 231},
    {jan: 35, feb: 342, mar: 243, apr: 231, may: 428, jun: 231},
    {jan: 568, feb: 531, mar: 243, apr: 231, may: 428, jun: 231},
    {jan: 365, feb: 361, mar: 243, apr: 231, may: 428, jun: 231},
    {section: 'big-title', jan: 'Warehouse 2'},
    {section: 'quarters', jan: 'Q1', apr: 'Q2'},
    {jan: 21, feb: 12, mar: 24, apr: 31, may: 28, jun: 31},
    {jan: 21, feb: 12, mar: 24, apr: 31, may: 28, jun: 31},
    {jan: 21, feb: 12, mar: 24, apr: 31, may: 28, jun: 31},
    {jan: 21, feb: 12, mar: 24, apr: 31, may: 28, jun: 31},
    {jan: 2, feb: 32, mar: 24, apr: 31, may: 48, jun: 21},
    {jan: 21, feb: 12, mar: 24, apr: 31, may: 28, jun: 31}
];

var gridOptions = {
    getRowHeight: function(params) {
        return isHeaderRow(params) ? 40 : 25;
    },
    columnDefs: columnDefs,
    rowData: rowData,
    defaultColDef: {
        width: 100
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
