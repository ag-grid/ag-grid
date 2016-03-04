var columnDefs = [
    {
        headerName: "Group A",
        groupId: "GroupA",
        children: [
            {headerName: "Athlete 1", field: "athlete", width: 150, filter: 'text'},
            {
                headerName: "Group B",
                groupId: "GroupB",
                children: [
                    {headerName: "Age 2", field: "age", width: 90, filter: 'number'},
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
                                            {headerName: "Total 1", field: "total", width: 100, filter: 'number'},
                                            {
                                                headerName: "Group F",
                                                groupId: "GroupF",
                                                children: [
                                                    {headerName: "Gold 1", field: "gold", width: 100, filter: 'number'},
                                                    {
                                                        headerName: "Group G",
                                                        groupId: "GroupG",
                                                        children: [
                                                            {headerName: "Silver 1", field: "silver", width: 100, filter: 'number'},
                                                            {
                                                                headerName: "Group H",
                                                                groupId: "GroupH",
                                                                children: [
                                                                    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'}
                                                                ]
                                                            },
                                                            {headerName: "Silver 2", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'}
                                                        ]
                                                    },
                                                    {headerName: "Gold 2", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'}
                                                ]
                                            },
                                            {headerName: "Total 2", columnGroupShow: 'open', field: "total", width: 100, filter: 'number'}
                                        ]
                                    },
                                    {headerName: "Sport 2", columnGroupShow: 'open', field: "sport", width: 110}
                                ]
                            },
                            {headerName: "Country 2", columnGroupShow: 'open', field: "country", width: 120}
                        ]
                    },
                    {headerName: "Age 2", columnGroupShow: 'open', field: "age", width: 90, filter: 'number'}
                ]
            },
            {headerName: "Athlete 2", columnGroupShow: 'open', field: "athlete", width: 150, filter: 'text'}
        ]
    }
];

var gridOptions = {
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    groupHeaders: true,
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    icons: {
        columnGroupOpened: '<i class="fa fa-minus-square-o"/>',
        columnGroupClosed: '<i class="fa fa-plus-square-o"/>'
    }
};

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
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
