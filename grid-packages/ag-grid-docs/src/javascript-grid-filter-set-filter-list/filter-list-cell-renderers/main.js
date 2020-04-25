var COUNTRY_CODES = {
    Ireland: "ie",
    Luxembourg: "lu",
    Belgium: "be",
    Spain: "es",
    France: "fr",
    Germany: "de",
    Sweden: "se",
    Italy: "it",
    Greece: "gr",
    Iceland: "is",
    Portugal: "pt",
    Malta: "mt",
    Norway: "no",
    Brazil: "br",
    Argentina: "ar",
    Colombia: "co",
    Peru: "pe",
    Venezuela: "ve",
    Uruguay: "uy"
};

var gridOptions = {
    columnDefs: [
        // set filters
        {
            field: 'country',
            cellRenderer: 'countryCellRenderer',
            filter: 'agSetColumnFilter',
            filterParams: {
                cellRenderer: 'countryCellRenderer'
            }
        },

        // number filters
        { field: 'gold', filter: 'agNumberColumnFilter' },
        { field: 'silver', filter: 'agNumberColumnFilter' },
        { field: 'bronze', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
        floatingFilter: true,
    },
    components: {
        countryCellRenderer: countryCellRenderer
    }
};

function countryCellRenderer(params) {
    if (params.value === "" || params.value === undefined || params.value === null) {
        return '';
    } else {
        // source https://flagpedia.net/
        var flag = '<img class="flag" border="0" width="15" height="10" src="https://flags.fmcdn.net/data/flags/mini/' + COUNTRY_CODES[params.value] + '.png">';
        return flag + ' ' + params.value;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            var dataMod = data.filter(function(d) {
                return COUNTRY_CODES[d.country];
            });
            gridOptions.api.setRowData(dataMod);
        });
});
