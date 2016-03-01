var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableRangeSelection: true,
    getContextMenuItems: getContextMenuItems
};

function getContextMenuItems(params) {
    var result = [];

    result.push(
        {
            name: 'Alert ' + params.value,
            action: function () {window.alert('Alerting about ' + params.value); }
        }
    );

    result.push(
        {
            name: 'Always Disabled',
            disabled: true
        }
    );

    result.push(
        {
            name: 'Windows',
            shortcut: 'Alt + W',
            action: function() { console.log('Windows Item Selected'); },
            icon: '<img src="../images/skills/windows.png"/>'
        }
    );

    result.push(
        {
            name: 'Mac',
            shortcut: 'Alt + M',
            action: function() { console.log('Mac Item Selected'); },
            icon: '<img src="../images/skills/mac.png"/>'
        }
    );

    result.push(
        {
            name: 'Checked',
            checked: true,
            action: function() { console.log('Checked Selected'); },
            icon: '<img src="../images/skills/mac.png"/>'
        }
    );

    // put in the default 'copy' at the bottom
    result.push('copy');

    return result;
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