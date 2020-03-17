var columnDefs = [
    {
        groupId: 'athleteGroupId',
        headerName: 'Athlete',
        children: [
            { headerName: 'Name', field: "athlete", minWidth: 200, filter: 'agTextColumnFilter'},
            {
                groupId: 'competitionGroupId',
                headerName: 'Competition',
                children: [
                    { field: "year" },
                    { field: "date", minWidth: 180 },
                ]
            },
        ]
    },
    {
        groupId: 'medalsGroupId',
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
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        filter: true,
        sortable: true,
        resizable: true,
    },
    sideBar: 'columns',
    onGridReady: function(params) {
        params.api.getToolPanelInstance('columns').collapseColumnGroups();
    }
};

function expandAllGroups() {
    gridOptions.api.getToolPanelInstance('columns').expandColumnGroups();
}

function collapseAllGroups() {
    gridOptions.api.getToolPanelInstance('columns').collapseColumnGroups();
}

function expandAthleteAndCompetitionGroups() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.expandColumnGroups(['athleteGroupId', 'competitionGroupId']);
}

function collapseCompetitionGroups() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.collapseColumnGroups(['competitionGroupId']);
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
