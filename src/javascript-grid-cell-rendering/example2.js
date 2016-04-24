var gridOptions;

function sunshinePerTenDays(params) {
    var byTenDays = params.value / 10;
    var resultElement = document.createElement("span");
    for (var i = 0; i<params.value; i++) {
        var starImageElement = document.createElement("img");
        starImageElement.src = "/images/goldStar.png";
        resultElement.appendChild(starImageElement);
    }
    return resultElement;
}

function deltaIndicator(params, field) {
    var rowsToDisplay = gridOptions.api.getModel().rowsToDisplay;

    var index = params.node.childIndex - 1;
    if (params.node.firstChild) {
        index = rowsToDisplay[rowsToDisplay.length - 1].childIndex;
    }

    var result = "";
    if (params.value > rowsToDisplay[index].data[field]) {
        result += "+ ";
    } else if (params.value < rowsToDisplay[index].data[field]) {
        result += "< ";
    } else {
        result += "  ";
    }
    result += params.value;
    return result;
}

var columnDefs = [
    {headerName: "Month", field: "Month", width: 50, cellStyle: {color: 'darkred'}},
    {headerName: "Max temp (C)", field: "Max temp (C)", width: 110, cellRenderer: function(params) {
        return deltaIndicator(params, "Max temp (C)");
    }},
    {headerName: "Min temp (C)", field: "Min temp (C)", width: 110, cellRenderer: function(params) {
        return deltaIndicator(params, "Min temp (C)");
    }},
    {headerName: "Days of air frost (days)", field: "Days of air frost (days)", width: 190},
    {headerName: "Sunshine (hours)", field: "Sunshine (hours)", width: 130},
    {headerName: "Rainfall (mm)", field: "Rainfall (mm)", width: 110},
    {headerName: "Days of rainfall >= 1 mm (days)", field: "Days of rainfall >= 1 mm (days)", width: 233, cellRenderer: function(params) {
        var resultElement = document.createElement("span");
        //for (var i = 0; i<params.value; i++) {
        //    var starImageElement = document.createElement("img");
        //    starImageElement.src = "/images/goldStar.png";
        //    resultElement.appendChild(starImageElement);
        //}
        return resultElement;
    }}
];

gridOptions = {
    columnDefs: columnDefs,
    rowData: null,

};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    gridOptions.api.addCellRenderer("sunshinePerTenDays", sunshinePerTenDays);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../weather_se_england.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
