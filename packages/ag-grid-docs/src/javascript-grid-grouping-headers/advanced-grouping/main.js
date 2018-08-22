var columnDefs = [
    {
        headerName: "Group A",
        groupId: "GroupA",
        children: [
            {headerName: "Athlete 1", field: "athlete", width: 150, filter: 'agTextColumnFilter'},
            {
                headerName: "Group B",
                groupId: "GroupB",
                children: [
                    {headerName: "Age 2", field: "age", width: 90, filter: 'agNumberColumnFilter'},
                    {
                        headerName: "Group C",
                        groupId: "GroupC",
                        children: [
                            {headerName: "Country 1", field: "country", width: 120},
                            {
                                headerName: "Group D",
                                groupId: "GroupD",
                                children: [
                                    {headerName: "Sport 1", field: "sport", width: 110},
                                    {
                                        headerName: "Group E",
                                        groupId: "GroupE",
                                        children: [
                                            {headerName: "Total 1", field: "total", width: 100, filter: 'agNumberColumnFilter'},
                                            {
                                                headerName: "Group F",
                                                groupId: "GroupF",
                                                openByDefault: true,
                                                children: [
                                                    {headerName: "Gold 1", field: "gold", width: 100, filter: 'agNumberColumnFilter'},
                                                    {
                                                        headerName: "Group G",
                                                        groupId: "GroupG",
                                                        openByDefault: true,
                                                        children: [
                                                            {headerName: "Silver 1", field: "silver", width: 100, filter: 'agNumberColumnFilter'},
                                                            {
                                                                headerName: "Group H",
                                                                groupId: "GroupH",
                                                                children: [
                                                                    {headerName: "Bronze", field: "bronze", width: 100, filter: 'agNumberColumnFilter'}
                                                                ]
                                                            },
                                                            {headerName: "Silver 2", columnGroupShow: 'open', field: "silver", width: 100, filter: 'agNumberColumnFilter'}
                                                        ]
                                                    },
                                                    {headerName: "Gold 2", columnGroupShow: 'open', field: "gold", width: 100, filter: 'agNumberColumnFilter'}
                                                ]
                                            },
                                            {headerName: "Total 2", columnGroupShow: 'open', field: "total", width: 100, filter: 'agNumberColumnFilter'}
                                        ]
                                    },
                                    {headerName: "Sport 2", columnGroupShow: 'open', field: "sport", width: 110}
                                ]
                            },
                            {headerName: "Country 2", columnGroupShow: 'open', field: "country", width: 120}
                        ]
                    },
                    {headerName: "Age 2", columnGroupShow: 'open', field: "age", width: 90, filter: 'agNumberColumnFilter'}
                ]
            },
            {headerName: "Athlete 2", columnGroupShow: 'open', field: "athlete", width: 150, filter: 'agTextColumnFilter'}
        ]
    }
];

var gridOptions = {
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    defaultColGroupDef: {headerClass: headerClassFunc},
    defaultColDef: {headerClass: headerClassFunc},
    icons: {
        columnGroupOpened: '<i class="fa fa-plus-square-o"/>',
        columnGroupClosed: '<i class="fa fa-minus-square-o"/>'
    }
};

function headerClassFunc(params) {
    var foundC = false;
    var foundG = false;

    // for the bottom row of headers, column is present,
    // otherwise columnGroup is present. we are guaranteed
    // at least one is always present.
    var item = params.column ? params.column : params.columnGroup;

    // walk up the tree, see if we are in C or F groups
    while (item) {
        // if method getColGroupDef exists, then this is a group
        // console.log(item.getUniqueId());
        if (item.getDefinition().groupId==='GroupC') {
            foundC = true;
        } else if (item.getDefinition().groupId==='GroupG') {
            foundG = true;
        }
        item = item.getParent();
    }

    if (foundG) {
        return 'column-group-g';
    } else if (foundC) {
        return 'column-group-c';
    } else {
        return null;
    }
}

function expandAll(expand) {
    var columnApi = gridOptions.columnApi;
    var groupNames = ['GroupA','GroupB','GroupC','GroupD','GroupE','GroupF','GroupG'];

    groupNames.forEach( function(groupId) {
        columnApi.setColumnGroupOpened(groupId, expand);
    });
}

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
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
