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
            caseSensitive: true,
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

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
