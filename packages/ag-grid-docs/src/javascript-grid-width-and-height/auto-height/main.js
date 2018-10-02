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

function setAutoHeight() {
    gridOptions.api.setDomLayout('autoHeight');
    // auto height will get the grid to fill the height of the contents,
    // so the grid div should have no height set, the height is dynamic.
    document.querySelector('#myGrid').style.height = '';
}

function setFixedHeight() {
    // we could also call setDomLayout(null or undefined) here as normal is the default
    gridOptions.api.setDomLayout('normal');
    // when auto height is off, the grid ahs a fixed height, and then the grid
    // will provide scrollbars if the data does not fit into it.
    document.querySelector('#myGrid').style.height = '400px';
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
    columnDefs: columnDefs,
    statusBar: {
        items: [
            { component: 'agAggregationComponent' }
        ]
    },
    enableRangeSelection: true,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    domLayout: 'autoHeight',
    animateRows: true,
    onGridReady: function() {
        document.querySelector('#currentRowCount').innerHTML = 5;
    }
};
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});