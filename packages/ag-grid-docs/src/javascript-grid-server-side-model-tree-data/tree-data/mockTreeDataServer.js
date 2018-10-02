function ServerSideDatasource(fakeServer) {
    this.fakeServer = fakeServer;
}

ServerSideDatasource.prototype.getRows = function(params) {
    // console.log('ServerSideDatasource.getRows: params = ', params);

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
          group: !!d.children,
          employeeId: d.employeeId,
          employeeName: d.employeeName,
          employmentType: d.employmentType,
          jobTitle: d.jobTitle
        }
      });
    }

    var key = groupKeys[0];
    for (var i = 0; i < data.length; i++) {
      if (data[i].employeeId === key) {
        return extractRowsFromData(groupKeys.slice(1), data[i].children.slice());
      }
    }
  }

  return extractRowsFromData(request.groupKeys, this.data);
};