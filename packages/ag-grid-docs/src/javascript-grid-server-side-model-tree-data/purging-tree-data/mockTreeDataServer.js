function ServerSideDatasource(fakeServer) {
    this.fakeServer = fakeServer;
}

ServerSideDatasource.prototype.getRows = function(params) {
    console.log('ServerSideDatasource.getRows: params = ', params);

    var rows = this.fakeServer.getData(params.request);

    setTimeout(function() {
      params.successCallback(rows, rows.length);
    }, 200);
};

function FakeServer(allData) {
  this.data = allData;
}

FakeServer.prototype.getData = function(request) {
  function extractRowsFromData(groupKeys, data) {
    if (groupKeys.length === 0) {
      return data.map(d => {
        return {
          group: !!d.underlings,
          employeeId: d.employeeId + "",
          employeeName: d.employeeName,
          employmentType: d.employmentType,
          startDate: d.startDate
        }
      });
    }

    var key = groupKeys[0];
    for (var i = 0; i < data.length; i++) {
      if (data[i].employeeName === key) {
        return extractRowsFromData(groupKeys.slice(1), data[i].underlings.slice());
      }
    }
  }

  return extractRowsFromData(request.groupKeys, this.data);
};