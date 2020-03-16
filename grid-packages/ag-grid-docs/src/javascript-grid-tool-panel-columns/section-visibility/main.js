var gridOptions = {
    columnDefs: [
        { headerName: "Name", field: "athlete", minWidth: 200 },
        { field: "age", enableRowGroup: true },
        { field: "country", minWidth: 200 },
        { field: "year" },
        { field: "date", suppressColumnsToolPanel: true, minWidth: 180 },
        { field: "sport", minWidth: 200 },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' },
        { field: "total", aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        enablePivot: true
    },
    sideBar: {
        toolPanels: [{
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivots: true,
                suppressPivotMode: true,
                suppressSideButtons: true,
                suppressColumnFilter: true,
                suppressColumnSelectAll: true,
                suppressColumnExpandAll: true
            }
        }],
        defaultToolPanel: 'columns'
    }
};

function showPivotModeSection() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.setPivotModeSectionVisible(true);
}

function showRowGroupsSection() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.setRowGroupsSectionVisible(true);
}

function showValuesSection() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.setValuesSectionVisible(true);
}

function showPivotSection() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.setPivotSectionVisible(true);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
