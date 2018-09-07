var columnDefs = [
    {
        headerName: 'Athlete Details',
        children: [
            {headerName: 'Athlete', field: 'athlete', width: 150, suppressSizeToFit: true, enableRowGroup: true, rowGroupIndex: 0},
            {headerName: 'Age', field: 'age', width: 90, minwidth: 75, maxWidth: 100, enableRowGroup: true},
            {headerName: 'Country', field: 'country', width: 120, enableRowGroup: true},
            {headerName: 'Year', field: 'year', width: 90, enableRowGroup: true, pivotIndex: 0},
            {headerName: 'Sport', field: 'sport', width: 110, enableRowGroup: true},
            {
                headerName: 'Gold',
                field: 'gold',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum'
            },
            {
                headerName: 'Silver',
                field: 'silver',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum'
            },
            {
                headerName: 'Bronze',
                field: 'bronze',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum'
            },
            {
                headerName: 'Total',
                field: 'total',
                width: 60,
                enableValue: true,
                suppressMenu: true,
                filter: 'agNumberColumnFilter',
                aggFunc: 'sum'
            }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableColResize: true,
    floatingFilter: true,
    enableSorting: true
};

function setIdText(id, value) {
    document.getElementById(id).innerHTML = value == null ? 'null' : value;
}

function setPivotOn() {
    document.querySelector('#requiresPivot').className = '';
    document.querySelector('#requiresNotPivot').className = 'hidden';
    gridOptions.columnApi.setPivotMode(true);
    setIdText('pivot', 'on');
}

function setPivotOff() {
    document.querySelector('#requiresPivot').className = 'hidden';
    document.querySelector('#requiresNotPivot').className = '';
    gridOptions.columnApi.setPivotMode(false);
    setIdText('pivot', 'off');
}

function setHeaderHeight(value) {
    gridOptions.api.setHeaderHeight(value);
    setIdText('headerHeight', value);
}

function setGroupHeaderHeight(value) {
    gridOptions.api.setGroupHeaderHeight(value);
    setIdText('groupHeaderHeight', value);
}

function setFloatingFiltersHeight(value) {
    gridOptions.api.setFloatingFiltersHeight(value);
    setIdText('floatingFiltersHeight', value);
}

function setPivotGroupHeaderHeight(value) {
    gridOptions.api.setPivotGroupHeaderHeight(value);
    setIdText('pivotGroupHeaderHeight', value);
}

function setPivotHeaderHeight(value) {
    gridOptions.api.setPivotHeaderHeight(value);
    setIdText('pivotHeaderHeight', value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
