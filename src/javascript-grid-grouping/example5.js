var FLAG_CODES = {
    'Ireland': 'ie',
    'United States': 'us',
    'Russia': 'ru',
    'Australia': 'au',
    'Canada': 'ca',
    'Norway': 'no',
    'China': 'cn',
    'Zimbabwe': 'zw',
    'Netherlands': 'nl',
    'South Korea': 'kr',
    'Croatia': 'hr',
    'France': 'fr'
};

var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 200},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100},
    {headerName: "Country", field: "country", width: 120, rowGroupIndex: 0},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupUseEntireRow: true,
    groupAggFunction: groupAggFunction,
    groupRowInnerRenderer: groupRowInnerRendererFunc
};

function groupRowInnerRendererFunc(params) {
    var flagCode = FLAG_CODES[params.node.key];

    var html = '';
    if (flagCode) {
        html += '<img class="flag" border="0" width="20" height="15" src="https://flags.fmcdn.net/data/flags/mini/'+flagCode+'.png">'
    }

    html += '<span class="groupTitle"> COUNTRY_NAME</span>'.replace('COUNTRY_NAME', params.node.key);
    html += '<span class="medal gold"> Gold: GOLD_COUNT</span>'.replace('GOLD_COUNT', params.data.gold);
    html += '<span class="medal silver"> Silver: SILVER_COUNT</span>'.replace('SILVER_COUNT', params.data.silver);
    html += '<span class="medal bronze"> Bronze: BRONZE_COUNT</span>'.replace('BRONZE_COUNT', params.data.bronze);

    return html;
}

function groupAggFunction(nodes) {

    var sums = {
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
        minAge: 100,
        maxAge: 0
    };

    nodes.forEach(function(node) {

        var data = node.data;

        if (node.group) {

            if (sums.minAge > data.minAge) {
                sums.minAge = data.minAge;
            }
            if (sums.maxAge < data.maxAge) {
                sums.maxAge = data.maxAge;
            }

        } else {

            if (sums.minAge > data.age) {
                sums.minAge = data.age;
            }
            if (sums.maxAge < data.age) {
                sums.maxAge = data.age;
            }

        }

        sums.gold += data.gold;
        sums.silver += data.silver;
        sums.bronze += data.bronze;
        sums.total += data.total;

    });

    return sums;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});