var masterColumnDefs = [
    // group cell renderer needed for expand / collapse icons
    {field: 'name', cellRenderer: 'group'},
    {field: 'account'},
    {field: 'calls'},
    {field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'"}
];

var masterGridOptions = {
    columnDefs: masterColumnDefs,
    rowData: rowData,
    masterDetail: true,
    groupDefaultExpanded: 1,
    detailCellRendererParams: {
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    },
    detailRowHeight: 70,
    detailCellRenderer: DetailCellRenderer,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

function DetailCellRenderer() {}

DetailCellRenderer.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML =
        '<form>' +
        '  <div>' +
        '  <p>' +
        '    <label>' +
        '      Name:<br>' +
        '    <input type="text" value="' + params.data.name + '">' +
        '    </label>' +
        '  </p>' +
        '  <p>' +
        '    <label>' +
        '      Account:<br>' +
        '    <input type="text" value="' + params.data.account + '">' +
        '    </label>' +
        '  </p>' +
        '  <p>' +
        '    <label>' +
        '      Calls:<br>' +
        '    <input type="number" value="' + params.data.calls + '">' +
        '    </label>' +
        '  </p>' +
        '</form>' +
        '</div>';
};

DetailCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, masterGridOptions);
});