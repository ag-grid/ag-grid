
var columnDefs = [
    {
        headerName: "<span style='background-color: lightblue'>Group 1</span>",
        groupId: "Group1",
        children: [
            {headerName: "AAA", field: "athlete", pinned: true, width: 100},
            {headerName: "BBB", field: "age", pinned: true, columnGroupShow: 'open', width: 100},
            {headerName: "CCC", field: "country", width: 100},
            {headerName: "DDD", field: "year", columnGroupShow: 'open', width: 100},
            {headerName: "EEE", field: "date", width: 100},
            {headerName: "FFF", field: "sport", columnGroupShow: 'open', width: 100},
            {headerName: "GGG", field: "date", width: 100},
            {headerName: "HHH", field: "sport", columnGroupShow: 'open', width: 100}
        ]
    },
    {
        headerName: "<span style='background-color: lightgreen'>Group 2</span>",
        groupId: "Group2",
        children: [
            {headerName: "AAA", field: "athlete", pinned: true, width: 100},
            {headerName: "BBB", field: "age", pinned: true, columnGroupShow: 'open', width: 100},
            {headerName: "CCC", field: "country", width: 100},
            {headerName: "DDD", field: "year", columnGroupShow: 'open', width: 100},
            {headerName: "EEE", field: "date", width: 100},
            {headerName: "FFF", field: "sport", columnGroupShow: 'open', width: 100},
            {headerName: "GGG", field: "date", width: 100},
            {headerName: "HHH", field: "sport", columnGroupShow: 'open', width: 100}
        ]
    }
];

// this is the grid options for the top grid
var gridOptionsTop = {
    columnDefs: columnDefs,
    groupHeaders: true,
    rowData: null,
    enableColResize: true,
    debug: true,
    slaveGrids: []
};

// this is the grid options for the bottom grid
var gridOptionsBottom = {
    columnDefs: columnDefs,
    groupHeaders: true,
    rowData: null,
    enableColResize: true,
    debug: true,
    slaveGrids: []
};

gridOptionsTop.slaveGrids.push(gridOptionsBottom);
gridOptionsBottom.slaveGrids.push(gridOptionsTop);

function setData(rowData) {
    gridOptionsTop.api.setRowData(rowData);
    gridOptionsBottom.api.setRowData(rowData);
    gridOptionsTop.api.sizeColumnsToFit();

    // mix up some columns
    gridOptionsTop.columnApi.moveColumn(11,4);
    gridOptionsTop.columnApi.moveColumn(11,4);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDivTop = document.querySelector('#myGridTop');
    new agGrid.Grid(gridDivTop, gridOptionsTop);

    var gridDivBottom = document.querySelector('#myGridBottom');
    new agGrid.Grid(gridDivBottom, gridOptionsBottom);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            setData(httpResult);
        }
    };
});