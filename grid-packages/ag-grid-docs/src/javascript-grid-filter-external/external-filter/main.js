var columnDefs = [
    { field: "athlete", minWidth: 180 },
    { field: "age", filter: 'agNumberColumnFilter', maxWidth: 80 },
    { field: "country" },
    { field: "year", maxWidth: 90 },
    {
        field: "date",
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator:function (filterLocalDateAtMidnight, cellValue){
                var dateAsString = cellValue;
                var dateParts  = dateAsString.split("/");
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                    return 0
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            }
        }
    },
    { field: "gold", filter: 'agNumberColumnFilter' },
    { field: "silver", filter: 'agNumberColumnFilter' },
    { field: "bronze", filter: 'agNumberColumnFilter' },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        filter: true
    },
    animateRows: true,
    isExternalFilterPresent: isExternalFilterPresent,
    doesExternalFilterPass: doesExternalFilterPass
};

var ageType = 'everyone';

function isExternalFilterPresent() {
    // if ageType is not everyone, then we are filtering
    return ageType != 'everyone';
}

function doesExternalFilterPass(node) {
    switch (ageType) {
        case 'below30': return node.data.age < 30;
        case 'between30and50': return node.data.age >= 30 && node.data.age <= 50;
        case 'above50': return node.data.age > 50;
        case 'dateAfter2008': return asDate(node.data.date) > new Date(2008,1,1);
        default: return true;
    }
}

function asDate (dateAsString){
    var splitFields = dateAsString.split("/");
    return new Date(splitFields[2], splitFields[1], splitFields[0]);
}

function externalFilterChanged(newValue) {
    ageType = newValue;
    gridOptions.api.onFilterChanged();
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
