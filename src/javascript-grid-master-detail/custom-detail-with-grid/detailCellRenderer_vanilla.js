function DetailCellRenderer() {}

DetailCellRenderer.prototype.init = function(params) {
    // trick to convert string of HTML into DOM object
    var eTemp = document.createElement('div');
    eTemp.innerHTML = this.getTemplate(params.data);
    this.eGui = eTemp.firstElementChild;
    this.setupDetailGrid(params.data.callRecords);
};

DetailCellRenderer.prototype.setupDetailGrid = function(callRecords) {
    var eDetailGrid = this.eGui.querySelector('.full-width-grid');
    new agGrid.Grid(eDetailGrid, {
        columnDefs: [
            {field: 'callId'},
            {field: 'direction'},
            {field: 'number'},
            {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
            {field: 'switchCode'}
        ],
        rowData: callRecords
    });
};

DetailCellRenderer.prototype.getTemplate = function(data) {
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

DetailCellRenderer.prototype.getGui = function() {
    return this.eGui;
};

DetailCellRenderer.prototype.destroy = function() {
    this.detailGridOptions.api.destroy();
};