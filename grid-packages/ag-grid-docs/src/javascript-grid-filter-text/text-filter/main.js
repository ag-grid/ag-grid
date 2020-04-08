var columnDefs = [
    {
        field: 'athlete',
        filter: 'agTextColumnFilter',
        filterParams: {
            filterOptions: ['contains', 'notContains'],
            textFormatter: function(r) {
                if (r == null) return null;

                return r.toLowerCase()
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
            },
            debounceMs: 0,
            caseSensitive: true,
            suppressAndOrCondition: true
        }
    },
    {
        field: 'country',
        filterParams: {
            filterOptions: ['contains'],
            textCustomComparator: function(_, value, filterText) {
                var filterTextLowerCase = filterText.toLowerCase();
                var valueLowerCase = value.toString().toLowerCase();
                var aliases = {
                    usa: 'united states',
                    holland: 'netherlands',
                    vodka: 'russia',
                    niall: 'ireland',
                    sean: 'south africa',
                    alberto: 'mexico',
                    john: 'australia',
                    xi: 'china'
                };

                function contains(target, lookingFor) {
                    return target && target.indexOf(lookingFor) >= 0;
                }

                var literalMatch = contains(valueLowerCase, filterTextLowerCase);
                return literalMatch || contains(valueLowerCase, aliases[filterTextLowerCase]);
            },
            debounceMs: 2000
        }
    },
    {
        field: 'year',
        filter: 'agNumberColumnFilter',
        filterParams: {
            filterOptions: ['inRange']
        }
    },
    {
        field: 'sport',
        filter: 'agTextColumnFilter',
        filterParams: {
            defaultOption: 'startsWith'
        }
    }
];

var gridOptions = {
    defaultColDef: {
        flex: 1,
        sortable: true,
        filter: true,
        floatingFilter: true,
    },
    columnDefs: columnDefs,
    rowData: null,
};

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
