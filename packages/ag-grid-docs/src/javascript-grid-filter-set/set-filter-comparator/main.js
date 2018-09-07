function getAllAges() {
    var allAges = [];
    for (var i = 0; i < 100; i++) {
        allAges.push('' + i);
    }
    return allAges;
}

function replaceAccents(s) {
    var r = s.toLowerCase();
    r = r.replace(new RegExp('[àáâãäå]', 'g'), 'a');
    r = r.replace(new RegExp('æ', 'g'), 'ae');
    r = r.replace(new RegExp('ç', 'g'), 'c');
    r = r.replace(new RegExp('[èéêë]', 'g'), 'e');
    r = r.replace(new RegExp('[ìíîï]', 'g'), 'i');
    r = r.replace(new RegExp('ñ', 'g'), 'n');
    r = r.replace(new RegExp('[òóôõøö]', 'g'), 'o');
    r = r.replace(new RegExp('œ', 'g'), 'oe');
    r = r.replace(new RegExp('[ùúûü]', 'g'), 'u');
    r = r.replace(new RegExp('[ýÿ]', 'g'), 'y');
    r = r.replace(new RegExp('\\W', 'g'), '');
    return r;
}

var columnDefs = [
    {
        headerName: 'Athlete',
        field: 'athlete',
        width: 150,
        filter: 'agSetColumnFilter',
        filterParams: {
            textFormatter: replaceAccents
        }
    },
    {
        headerName: 'Age - Comparator',
        field: 'age',
        width: 200,
        filter: 'agSetColumnFilter',
        filterParams: {
            values: getAllAges(),
            comparator: function(a, b) {
                var numA = parseInt(a);
                var numB = parseInt(b);
                if (numA > numB) {
                    return 1;
                } else if (numA < numB) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    },
    {
        headerName: 'Age - No Comparator',
        field: 'age',
        width: 200,
        filter: 'agSetColumnFilter',
        filterParams: {
            values: getAllAges()
        }
    },
    {headerName: 'Country', field: 'country', width: 140}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableColResize: true
};

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
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
