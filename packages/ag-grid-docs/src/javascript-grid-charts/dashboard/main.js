var columnDefs = [
    {field: "athlete", width: 150, enableRowGroup: true, filter: true},
    {field: "country", enableRowGroup: true, filter: true},
    {field: "year", enableRowGroup: true, filter: true},
    {field: "sport", enableRowGroup: true, filter: true},
    {field: "total", enableValue: true, valueParser: numberValueParser},
    {field: "gold", enableValue: true, valueParser: numberValueParser},
    {field: "silver", enableValue: true, valueParser: numberValueParser},
    {field: "bronze", enableValue: true, valueParser: numberValueParser}
];

function numberValueParser(params) {
    let res = Number.parseInt(params.newValue);
    if (isNaN(res)) {
        return undefined;
    } else {
        return res;
    }
}

var gridOptions = {
    defaultColDef: {
        width: 100,
        resizable: true,
        sortable: true,
        editable: true
    },
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableCharts: true,
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered() {
    let eContainer1 = document.querySelector('#chart1');
    let params1 = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['total']
        },
        chartType: 'groupedBar',
        chartContainer: eContainer1
    };
    gridOptions.api.chartRange(params1);


    let eContainer2 = document.querySelector('#chart2');
    let params2 = {
        cellRange: {
            columns: ['country','total']
        },
        chartType: 'pie',
        chartContainer: eContainer2,
        aggFunc: 'sum'
    };
    gridOptions.api.chartRange(params2);


    let eContainer3 = document.querySelector('#chart3');
    let params3 = {
        cellRange: {
            columns: ['year','total']
        },
        chartType: 'pie',
        chartContainer: eContainer3,
        aggFunc: 'sum'
    };
    gridOptions.api.chartRange(params3);

}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/wideSpreadOfSports.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});