function createNormalColDefs() {
    return [
        {
            headerName: 'Athlete Details',
            headerClass: 'participant-group',
            children: [
                {field: 'athlete', colId: 'athlete'},
                {field: 'country', colId: 'country'}
            ]
        },
        {field: 'age', colId: 'age'},
        {
            headerName: 'Sports Results',
            headerClass: 'medals-group',
            children: [
                {field: 'sport', colId: 'sport'},
                {field: 'gold', colId: 'gold'}
            ]
        }
    ];
}

function createExtraColDefs() {
    return [
        {
            headerName: 'Athlete Details',
            headerClass: 'participant-group',
            children: [
                {field: 'athlete', colId: 'athlete'},
                {field: 'country', colId: 'country'},
                {field: 'region1', colId: 'region1'},
                {field: 'region2', colId: 'region2'}
            ]
        },
        {field: 'age', colId: 'age'},
        {field: 'distance', colId: 'distance'},
        {
            headerName: 'Sports Results',
            headerClass: 'medals-group',
            children: [
                {field: 'sport', colId: 'sport'},
                {field: 'gold', colId: 'gold'}
            ]
        }
    ];
}

function onBtNormalCols() {
    gridOptions.api.setColumnDefs(createNormalColDefs());
}

function onBtExtraCols() {
    gridOptions.api.setColumnDefs(createExtraColDefs());
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