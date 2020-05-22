var rowData = [
    {
        a1: 111, b1: 222, children: [
            {
                a2: 333, b2: 444, children: [
                    { a3: 5551, b3: 6661 },
                    { a3: 5552, b3: 6662 },
                    { a3: 5553, b3: 6663 },
                    { a3: 5554, b3: 6664 },
                    { a3: 5555, b3: 6665 },
                    { a3: 5556, b3: 6666 },
                ]
            }]
    },
    {
        a1: 111, b1: 222, children: [
            {
                a2: 333, b2: 444, children: [
                    { a3: 5551, b3: 6661 },
                    { a3: 5552, b3: 6662 },
                    { a3: 5553, b3: 6663 },
                    { a3: 5554, b3: 6664 },
                    { a3: 5555, b3: 6665 },
                    { a3: 5556, b3: 6666 },
                ]
            }]
    }];

// level 1 grid options
var gridOptions = {
    rowData: rowData,
    columnDefs: [
        { field: 'a1', cellRenderer: 'agGroupCellRenderer' },
        { field: 'b1' }
    ],
    defaultColDef: {
        flex: 1
    },
    groupDefaultExpanded: 1,
    masterDetail: true,
    detailCellRendererParams: {

        autoHeight: true,

        // level 2 grid options
        detailGridOptions: {
            columnDefs: [
                { field: 'a2', cellRenderer: 'agGroupCellRenderer' },
                { field: 'b2' }
            ],
            defaultColDef: {
                flex: 1
            },
            groupDefaultExpanded: 1,
            masterDetail: true,
            detailRowHeight: 240,
            detailCellRendererParams: {

                autoHeight: true,

                // level 3 grid options
                detailGridOptions: {
                    columnDefs: [
                        { field: 'a3', cellRenderer: 'agGroupCellRenderer' },
                        { field: 'b3' }
                    ],
                    defaultColDef: {
                        flex: 1
                    },
                },
                getDetailRowData: function(params) {
                    params.successCallback(params.data.children);
                }
            },
        },
        getDetailRowData: function(params) {
            params.successCallback(params.data.children);
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
