var columnDefs = [
    {
        field: "athlete",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "age",
        enableValue: true
    },
    {
        field: "country",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
        headerValueGetter: countryHeaderValueGetter
    },
    {
        field: "year",
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "date",
        minWidth: 180,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "sport",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "gold",
        hide: true,
        enableValue: true,
        toolPanelClass: 'tp-gold'
    },
    {
        field: "silver",
        hide: true,
        enableValue: true,
        toolPanelClass: ['tp-silver']
    },
    {
        field: "bronze",
        hide: true,
        enableValue: true,
        toolPanelClass: function (params) {
            return 'tp-bronze';
        }
    },
    {
        headerName: "Total",
        field: "totalAgg",
        valueGetter: "node.group ? data.totalAgg : data.gold + data.silver + data.bronze",
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true
    },
    sideBar: 'columns',
    rowGroupPanelShow: 'always'
};

function countryHeaderValueGetter(params) {
    switch (params.location) {
        case 'csv': return 'CSV Country';
        case 'clipboard': return 'CLIP Country';
        case 'toolPanel': return 'TP Country';
        case 'columnDrop': return 'CD Country';
        case 'header': return 'H Country';
        default: return 'Should never happen!';
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
