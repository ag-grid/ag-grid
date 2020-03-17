// specify the data
var rowData = [
    {orgHierarchy: ['A']},
    {orgHierarchy: ['A', 'B']},
    {orgHierarchy: ['C', 'D']},
    {orgHierarchy: ['E', 'F', 'G', 'H']}
];

var gridOptions = {
    columnDefs: [
        // we're using the auto group column by default!
        {field: "groupType", valueGetter: function (params) {
                return params.data ? 'Provided' : 'Filler';
            }}
    ],
    defaultColDef: {
        flex: 1,
    },
    autoGroupColumnDef: {
        headerName: "Organisation Hierarchy",
        cellRendererParams: {
            suppressCount: true
        }
    },
    rowData: rowData,
    treeData: true, // enable Tree Data mode
    animateRows: true,
    groupDefaultExpanded: -1, // expand all groups by default
    getDataPath: function(data) {
        return data.orgHierarchy;
    }
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});
