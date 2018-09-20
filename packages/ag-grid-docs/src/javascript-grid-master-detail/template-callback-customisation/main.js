var columnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer: 'agGroupCellRenderer'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var gridOptions = {
    columnDefs: columnDefs,
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'number'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'}
            ],
            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            }
        },
        getDetailRowData: function (params) {
            params.successCallback(params.data.callRecords);
        },
        template: function (params) {
            var personName = params.data.name;
            return '<div style="height: 100%; background-color: #EDF6FF; padding: 20px; box-sizing: border-box;">'
                + '  <div style="height: 10%;">Name: ' + personName + '</div>'
                + '  <div ref="eDetailGrid" style="height: 90%;"></div>'
                + '</div>';
        }
    },
    onGridReady: function (params) {
        // arbitrarily expand a row for presentational purposes
        setTimeout(function () {
            var rowCount = 0;
            params.api.forEachNode(function (node) {
                node.setExpanded(rowCount++ === 1);
            });
        }, 500);
    },
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);


    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/latest/src/javascript-grid-master-detail/template-callback-customisation/data/data.json'}).then(function (data) {
        gridOptions.api.setRowData(data);
    });
});