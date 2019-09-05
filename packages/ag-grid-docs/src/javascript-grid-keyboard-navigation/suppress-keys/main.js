var columnDefs = [
    {field: "athlete", width: 200,
        suppressKeyboardEvent: suppressEnter,
    },
    {field: "age"},
    {field: "country"},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

function suppressEnter(params) {
    var KEY_ENTER = 13;

    var event = params.event;
    var key = event.which;
    var suppress = key === KEY_ENTER;

    return suppress;
}

var gridOptions = {
    rowData: null,
    columnDefs: columnDefs,
    defaultColDef: {
        width: 100,
        editable: true
    },
    enableRangeSelection: true,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    suppressKeyboardEvent: function(params) {
        var KEY_A = 65;
        var KEY_C = 67;
        var KEY_V = 86;
        var KEY_D = 68;

        var KEY_PAGE_UP = 33;
        var KEY_PAGE_DOWN = 34;
        var KEY_TAB = 9;
        var KEY_LEFT = 37;
        var KEY_UP = 38;
        var KEY_RIGHT = 39;
        var KEY_DOWN = 40;
        var KEY_F2 = 113;
        var KEY_BACKSPACE = 8;
        var KEY_ESCAPE = 27;
        var KEY_SPACE = 32;
        var KEY_DELETE = 46;
        var KEY_PAGE_HOME = 36;
        var KEY_PAGE_END = 35;

        var event = params.event;
        var key = event.which;

        var keysToSuppress = [KEY_PAGE_UP, KEY_PAGE_DOWN, KEY_TAB, KEY_F2, KEY_ESCAPE];

        var editingKeys = [KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_BACKSPACE, KEY_DELETE, KEY_SPACE, KEY_PAGE_HOME, KEY_PAGE_END];

        if (event.ctrlKey || event.metaKey) {
            keysToSuppress.push(KEY_A);
            keysToSuppress.push(KEY_V);
            keysToSuppress.push(KEY_C);
            keysToSuppress.push(KEY_D);
        }

        if (!params.editing) {
            keysToSuppress = keysToSuppress.concat(editingKeys);
        }

        var suppress = keysToSuppress.indexOf(key) >= 0;

        return suppress;
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});