var masterColumnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer: 'group'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var detailColumnDefs = [
    {field: 'callId'},
    {field: 'direction'},
    {field: 'number'},
    {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
    {field: 'switchCode'}
];

var detailGridOptions = {
    columnDefs: detailColumnDefs
};

var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,
    masterDetail: true,
    detailGridOptions: detailGridOptions,
    getDetailRowData: function(params) {
        params.successCallback(params.data.callRecords);
    },
    getRowHeight: function (params) {
        if(params.node && params.node.detail) {
            var offset = 75;
            var allDetailRowHeight = params.data.callRecords.length * 25;
            return allDetailRowHeight + offset;
        } else {
            // otherwise return fixed master row height
            return 50;
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, masterGridOptions);
});