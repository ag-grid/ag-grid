var columnDefs = [
    {
        groupId: 'athleteGroupId',
        headerName: 'Athlete',
        children: [
            {
                headerName: 'Name',
                field: "athlete",
                minWidth: 200,
                columnsMenuParams: {
                    // hides the Column Filter section
                    suppressColumnFilter: true,

                    // hides the Select / Un-select all widget
                    suppressColumnSelectAll: true,

                    // hides the Expand / Collapse all widget
                    suppressColumnExpandAll: true,
                }
            },
            {
                field: "age",
                minWidth: 200,
                columnsMenuParams: {
                    // contracts all column groups
                    contractColumnSelection: true
                }
            },
        ]
    },
    {
        groupId: 'medalsGroupId',
        headerName: 'Medals',
        children: [
            { field: "gold",  },
            { field: "silver" },
            { field: "bronze" }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        resizable: true,
        menuTabs: ['columnsMenuTab'],
        columnsMenuParams: {
            // suppresses updating the layout of columns as they are rearranged in the grid
            suppressSyncLayoutWithGrid: true,
        }
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
