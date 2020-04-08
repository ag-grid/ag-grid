var gridOptions = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agSetColumnFilter',
            filterParams: {
                textFormatter: replaceAccents
            }
        },
        {
            headerName: 'Age (With Comparator)',
            field: 'age',
            minWidth: 240,
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
            headerName: 'Age (No Comparator)',
            field: 'age',
            minWidth: 220,
            filter: 'agSetColumnFilter',
            filterParams: {
                values: getAllAges()
            }
        },
        { field: 'country' }
    ],
    defaultColDef: {
        flex: 1,
        filter: true,
        resizable: true,
    }
};

function getAllAges() {
    var allAges = [];
    for (var i = 0; i < 100; i++) {
        allAges.push('' + i);
    }
    return allAges;
}

function replaceAccents(s) {
    return s.toLowerCase()
        .replace(/\s/g, '')
        .replace(/[àáâãäå]/g, 'a')
        .replace(/æ/g, 'ae')
        .replace(/ç/g, 'c')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/ñ/g, 'n')
        .replace(/[òóôõö]/g, 'o')
        .replace(/œ/g, 'oe')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/\W/g, '');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
