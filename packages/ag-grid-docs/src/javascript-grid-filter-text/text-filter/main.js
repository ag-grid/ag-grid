var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'agTextColumnFilter', filterParams:{
        filterOptions:['contains', 'notContains'],
        textFormatter: function(r){
            if (r==null) return null;
            r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
            r = r.replace(new RegExp("æ", 'g'),"ae");
            r = r.replace(new RegExp("ç", 'g'),"c");
            r = r.replace(new RegExp("[èéêë]", 'g'),"e");
            r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
            r = r.replace(new RegExp("ñ", 'g'),"n");
            r = r.replace(new RegExp("[òóôõøö]", 'g'),"o");
            r = r.replace(new RegExp("œ", 'g'),"oe");
            r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
            r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
            return r;
        },
        debounceMs:0,
        caseSensitive:true,
        suppressAndOrCondition:true
    }},
    {headerName: "Country", field: "country", width: 120, filterParams:{
        filterOptions:['contains'],
        textCustomComparator: function  (filter, value, filterText) {
            var filterTextLoweCase = filterText.toLowerCase();
            var valueLowerCase = value.toString().toLowerCase();
            var aliases={
                usa:'united states',
                holland:'netherlands',
                vodka:'russia',
                niall:'ireland',
                sean:'south africa',
                alberto:'mexico',
                john:'australia',
                xi:'china'
            };

            function contains (target, lookingFor){
                if (target === null) return false;
                return target.indexOf(lookingFor) >= 0
            }

            var literalMatch = contains(valueLowerCase, filterTextLoweCase);
            return literalMatch || contains(valueLowerCase, aliases[filterTextLoweCase]);
        },
        debounceMs:2000
    }},
    {headerName: "Year", field: "year", width: 90, filter:'agNumberColumnFilter', filterParams:{
        filterOptions:['inRange']
    }},
    {headerName: "Sport", field: "sport", width: 90, filter: 'agTextColumnFilter', filterParams:{
        defaultOption:'startsWith'
    }}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true,

    // these hide enterprise features, so they are not confusing
    // you if using ag-Grid standard
    suppressContextMenu: true,
    suppressMenuMainPanel: true,
    suppressMenuColumnPanel: true,
    floatingFilter:true
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
