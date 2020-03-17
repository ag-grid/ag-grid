var columnDefs = [
    {
        groupId: 'athleteGroupId',
        headerName: 'Athlete',
        children: [
            { headerName: 'Name', field: "athlete", minWidth: 200, filter: 'agTextColumnFilter'},
            { field: "age" },
            {
                groupId: 'competitionGroupId',
                headerName: 'Competition',
                children: [
                    { field: "year" },
                    { field: "date", minWidth: 180 },
                ]
            },
            { field: "country", minWidth: 200}
        ]
    },
    { colId: 'sport', field: "sport", minWidth: 200 },
    {
        headerName: 'Medals',
        children: [
            { field: "gold" },
            { field: "silver" },
            { field: "bronze" },
            { field: "total" }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    sideBar: 'filters',
    onGridReady: function(params) {
        // initially collapse all filter groups
        params.api.getToolPanelInstance('filters').collapseFilterGroups();
    }
};

function collapseAll() {
    gridOptions.api.getToolPanelInstance('filters').collapseFilterGroups();
}

function expandAthleteAndCompetition() {
    gridOptions.api.getToolPanelInstance('filters').expandFilterGroups(['athleteGroupId', 'competitionGroupId']);
}

function collapseCompetition() {
    gridOptions.api.getToolPanelInstance('filters').collapseFilterGroups(['competitionGroupId']);
}

function expandAll() {
    gridOptions.api.getToolPanelInstance('filters').expandFilterGroups();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
