var columnDefs = [
    {
        headerName: "Row",
        field: "row"
    },
    {
        headerName: "Name",
        field: "name"
    }
];

function createRowData() {
    return [
        {"row": "Row 1", "name": "Michael Phelps"},
        {"row": "Row 2", "name": "Natalie Coughlin"},
        {"row": "Row 3", "name": "Aleksey Nemov"},
        {"row": "Row 4", "name": "Alicia Coutts"},
        {"row": "Row 5", "name": "Missy Franklin"},
        {"row": "Row 6", "name": "Ryan Lochte"},
        {"row": "Row 7", "name": "Allison Schmitt"},
        {"row": "Row 8", "name": "Natalie Coughlin"},
        {"row": "Row 9", "name": "Ian Thorpe"},
        {"row": "Row 10", "name": "Bob Mill"},
        {"row": "Row 11", "name": "Willy Walsh"},
        {"row": "Row 12", "name": "Sarah McCoy"},
        {"row": "Row 13", "name": "Jane Jack"},
        {"row": "Row 14", "name": "Tina Wills"}
    ];
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableRangeSelection: true,
    rowSelection: "multiple",
    components: {
        statusBarComponent: ClickableStatusBarComponent
    },
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'statusBarComponent'
            },
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams: {
                    aggFuncs: ['count', 'sum']
                }
            }
        ]
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
