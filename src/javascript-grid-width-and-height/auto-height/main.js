function createRow(index) {
    var makes = ['Toyota', 'Ford', 'BMW', 'Phantom', 'Porsche'];

    return {
        id: 'D' + (1000 + index),
        make: makes[Math.floor(Math.random() * makes.length)],
        price: Math.floor(Math.random() * 100000),
        val1: Math.floor(Math.random() * 1000),
        val2: Math.floor(Math.random() * 1000),
        val3: Math.floor(Math.random() * 1000),
        val4: Math.floor(Math.random() * 1000),
        val5: Math.floor(Math.random() * 1000),
        val6: Math.floor(Math.random() * 1000),
        val7: Math.floor(Math.random() * 1000),
        val8: Math.floor(Math.random() * 1000),
        val9: Math.floor(Math.random() * 1000),
        val10: Math.floor(Math.random() * 1000)
    };
}

function getData(count) {
    var rowData = [];
    for (var i = 0; i < count; i++) {
        rowData.push(createRow(i));
    }
    return rowData;
}

function setRowData(rowCount) {
    gridOptions.api.setRowData(getData(rowCount));

    document.querySelector('#currentRowCount').innerHTML = rowCount;
}

function cbFloatingRows() {
    var show = document.getElementById('floating-rows').checked;
    if (show) {
        gridOptions.api.setPinnedTopRowData([createRow(999), createRow(998)]);
        gridOptions.api.setPinnedBottomRowData([createRow(997), createRow(996)]);
    } else {
        gridOptions.api.setPinnedTopRowData(null);
        gridOptions.api.setPinnedBottomRowData(null);
    }
}

var columnDefs = [
    {
        headerName: 'Core',
        children: [{headerName: 'ID', field: 'id'}, {headerName: 'Make', field: 'make'}, {headerName: 'Price', field: 'price', filter: 'agNumberColumnFilter'}]
    },
    {
        headerName: 'Extra',
        children: [
            {headerName: 'Val 1', field: 'val1', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 2', field: 'val2', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 3', field: 'val3', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 4', field: 'val4', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 5', field: 'val5', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 6', field: 'val6', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 7', field: 'val7', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 8', field: 'val8', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 9', field: 'val9', filter: 'agNumberColumnFilter'},
            {headerName: 'Val 10', field: 'val10', filter: 'agNumberColumnFilter'}
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    },
    rowData: getData(5),
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    columnDefs: columnDefs,
    enableStatusBar: true,
    enableRangeSelection: true,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    domLayout: 'autoHeight',
    onGridReady: function() {
        document.querySelector('#currentRowCount').innerHTML = 5;
    }
};
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});