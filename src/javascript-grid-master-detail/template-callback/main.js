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
    detailCellRendererParams: {
        template: function(params) {
            var personName = params.data.name;
            return '<div style="height: 100%; background-color: #eef; padding: 20px; box-sizing: border-box;">'
                  +'  <div style="height: 10%;">Name: '+personName+'</div>'
                  +'  <div ref="eDetailGrid" style="height: 90%;"></div>'
                  +'</div>';
        }
    },
    getDetailRowData: function(params) {
        params.successCallback(params.data.callRecords);
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, masterGridOptions);
});