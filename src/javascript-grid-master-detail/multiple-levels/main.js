var data = [
  {a1: 111, b1: 222, children: [
      {a2: 333, b2: 444, children: [
          {a3: 555, b3: 666, children: [
              {a4: 777, b4: 888}]
          }]
      }]
  }];

var gridOptionsLevel4 = {
    columnDefs: [{field: 'a4', cellRenderer: 'group'}, {field: 'b4'}],
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

var gridOptionsLevel3 = {
    columnDefs: [{field: 'a3', cellRenderer: 'group'}, {field: 'b3'}],
    groupDefaultExpanded: 1,
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel4,
        getDetailRowData: function (params) {
            params.successCallback(params.data.children);
        }
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};


var gridOptionsLevel2 = {
    columnDefs: [{field: 'a2', cellRenderer: 'group'}, {field: 'b2'}],
    groupDefaultExpanded: 1,
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel3,
        getDetailRowData: function (params) {
            params.successCallback(params.data.children);
        }
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

var gridOptionsLevel1 = {
    columnDefs: [{field: 'a1', cellRenderer: 'group'}, {field: 'b1'}],
    rowData: data,
    groupDefaultExpanded: 1,
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: gridOptionsLevel2,
        getDetailRowData: function (params) {
            params.successCallback(params.data.children);
        }
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptionsLevel1);
});