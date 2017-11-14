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
    detailRowHeight: 260,
    detailCellRenderer: DetailPanelCellRenderer,
    onGridReady: function(params) {
        params.api.forEachNode(function (node) {
            node.setExpanded(node.id === "1");
        });
        params.api.sizeColumnsToFit();
    }
};

function DetailPanelCellRenderer() {}

DetailPanelCellRenderer.prototype.init = function(params) {
    // trick to convert string of HTML into DOM object
    var eTemp = document.createElement('div');
    eTemp.innerHTML = this.getTemplate(params.data);
    this.eGui = eTemp.firstElementChild;

    this.setupDetailGrid(params.data.callRecords);
};

DetailPanelCellRenderer.prototype.setupDetailGrid = function(callRecords) {
    this.detailGridOptions = {
        columnDefs: [
            {field: 'callId'},
            {field: 'direction'},
            {field: 'number'},
            {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
            {field: 'switchCode'}
        ],
        rowData: callRecords
    };

    var eDetailGrid = this.eGui.querySelector('.full-width-grid');
    new agGrid.Grid(eDetailGrid, this.detailGridOptions);
};

DetailPanelCellRenderer.prototype.getTemplate = function(data) {
    var template =
        '<div class="full-width-panel">' +
        '  <div class="full-width-details">' +
        '    <div class="full-width-detail"><b>Name: </b>'+data.name+'</div>' +
        '    <div class="full-width-detail"><b>Account: </b>'+data.account+'</div>' +
        '  </div>'+
        '  <div class="full-width-grid"></div>' +
        '  <div class="full-width-grid-toolbar">' +
        '       <img class="full-width-phone-icon" src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/phone.png"/>' +
        '       <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/fire.png"/></button>' +
        '       <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/frost.png"/></button>' +
        '       <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/sun.png"/></button>' +
        '  </div>'+
        '</div>';

    return template;
};

DetailPanelCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

DetailPanelCellRenderer.prototype.destroy = function() {
    this.detailGridOptions.api.destroy();
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, masterGridOptions);
});