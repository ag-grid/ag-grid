function createNormalColDefs() {
    return [
        {
            headerName: 'Athlete Details',
            marryChildren: true,
            children: [
                {field: 'athlete', colId: 'athlete'},
                {field: 'country', colId: 'country'}
            ]
        },
        {field: 'age', colId: 'age'},
        {
            headerName: 'Sports Results',
            marryChildren: true,
            children: [
                {field: 'sport', colId: 'sport'},
                {field: 'total', colId: 'total'},
                {field: 'gold', colId: 'gold'},
                {field: 'silver', colId: 'silver'},
                {field: 'bronze', colId: 'bronze'}
            ]
        }
    ];
}

var gridOptions = {
    defaultColDef: {
        resizable: true,
        width: 100
    },
    debug: true,
    columnDefs: createNormalColDefs(),
    rowData: null
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