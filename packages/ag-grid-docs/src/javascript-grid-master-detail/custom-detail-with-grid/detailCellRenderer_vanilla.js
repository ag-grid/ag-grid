function DetailCellRenderer() {
  this.masterGridApi = null;
  this.masterRowIndex = null;
}

DetailCellRenderer.prototype.init = function(params) {
  // trick to convert string of HTML into DOM object
  var eTemp = document.createElement('div');
  eTemp.innerHTML = this.getTemplate(params.data);
  this.eGui = eTemp.firstElementChild;

  this.masterGridApi = params.api;
  this.masterRowIndex = params.rowIndex;

  this.setupDetailGrid(params.data.callRecords, params.api, params.rowIndex);
};

DetailCellRenderer.prototype.setupDetailGrid = function(callRecords, masterGridApi, masterRowIndex) {
  var eDetailGrid = this.eGui.querySelector('.full-width-grid');
  new agGrid.Grid(eDetailGrid, {
    columnDefs: [
      {field: 'callId'},
      {field: 'direction'},
      {field: 'number'},
      {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
      {field: 'switchCode'}
    ],
    rowData: callRecords,
    onGridReady: function(params) {
      var detailGridId = "detail_" + masterRowIndex;

      var gridInfo = {
        id: detailGridId,
        api: params.api,
        columnApi: params.columnApi
      };

      console.log("adding detail grid info with id: ", detailGridId);
      masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
    }
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
    '</div>';

  return template;
};

DetailCellRenderer.prototype.getGui = function() {
  return this.eGui;
};

DetailCellRenderer.prototype.destroy = function() {
  var detailGridId = "detail_" + this.masterRowIndex;

  console.log("destroying detail grid with id: ", detailGridId);
  this.masterGridApi.getDetailGridInfo(detailGridId).api.destroy();

  console.log("removing detail grid info with id: ", detailGridId);
  this.masterGridApi.removeDetailGridInfo(detailGridId);
};