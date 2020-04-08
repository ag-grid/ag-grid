var columnDefs = [
    {
        headerName: "Group A",
        groupId: "GroupA",
        children: [
            { headerName: "Athlete 1", field: "athlete", width: 150, filter: 'agTextColumnFilter' },
            {

                headerName: "Group B",
                groupId: "GroupB",
                children: [
                    { headerName: "Country 1", field: "country", width: 120 },
                    {
                        headerName: "Group C",
                        groupId: "GroupC",
                        children: [
                            { headerName: "Sport 1", field: "sport", width: 110 },
                            {
                                headerName: "Group D",
                                groupId: "GroupD",
                                children: [
                                    { headerName: "Total 1", field: "total", width: 100, filter: 'agNumberColumnFilter' },
                                    {
                                        headerName: "Group E",
                                        groupId: "GroupE",
                                        openByDefault: true,
                                        children: [
                                            { headerName: "Gold 1", field: "gold", width: 100, filter: 'agNumberColumnFilter' },
                                            {
                                                headerName: "Group F",
                                                groupId: "GroupF",
                                                openByDefault: true,
                                                children: [
                                                    { headerName: "Silver 1", field: "silver", width: 100, filter: 'agNumberColumnFilter' },
                                                    {
                                                        headerName: "Group G",
                                                        groupId: "GroupG",
                                                        children: [
                                                            { headerName: "Bronze", field: "bronze", width: 100, filter: 'agNumberColumnFilter' }
                                                        ]
                                                    },
                                                    { headerName: "Silver 2", columnGroupShow: 'open', field: "silver", width: 100, filter: 'agNumberColumnFilter' }
                                                ]
                                            },
                                            { headerName: "Gold 2", columnGroupShow: 'open', field: "gold", width: 100, filter: 'agNumberColumnFilter' }
                                        ]
                                    },
                                    { headerName: "Total 2", columnGroupShow: 'open', field: "total", width: 100, filter: 'agNumberColumnFilter' }
                                ]
                            },
                            { headerName: "Sport 2", columnGroupShow: 'open', field: "sport", width: 110 }
                        ]
                    },
                    { headerName: "Country 2", columnGroupShow: 'open', field: "country", width: 120 }
                ]
            },
            { headerName: "Age 2", columnGroupShow: 'open', field: "age", width: 90, filter: 'agNumberColumnFilter' }
        ]
    },
    { headerName: "Athlete 2", columnGroupShow: 'open', field: "athlete", width: 150, filter: 'agTextColumnFilter' }
];

var gridOptions = {
    debug: true,
    columnDefs: columnDefs,
    rowData: null,
    defaultColGroupDef: { headerClass: headerClassFunc },
    defaultColDef: {
        headerClass: headerClassFunc,
        sortable: true,
        resizable: true,
        filter: true
    },
    icons: {
        columnGroupOpened: '<i class="far fa-minus-square"/>',
        columnGroupClosed: '<i class="far fa-plus-square"/>'
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
        if (item.getDefinition().groupId === 'GroupC') {
            foundC = true;
        } else if (item.getDefinition().groupId === 'GroupG') {
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
    var groupNames = ['GroupA', 'GroupB', 'GroupC', 'GroupD', 'GroupE', 'GroupF', 'GroupG'];

    groupNames.forEach(function(groupId) {
        columnApi.setColumnGroupOpened(groupId, expand);
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
