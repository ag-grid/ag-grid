
function MockServer() {
}

MockServer.prototype.init = function(allData) {
    this.allData = allData;
};

MockServer.prototype.setCallback = function(callback) {
    this.callback = callback;
};

MockServer.prototype.setViewportRange = function(start, end) {
    setTimeout( this.sendResultsToClient.bind(this, start, end), 100);
    // this.sendResultsToClient(start, end);
};

MockServer.prototype.sendResultsToClient = function(start, end) {
    if (start < 0 || end < start) {
        console.warn('start or end is not valid');
        return;
    }
    // the map contains row indexes mapped to rows
    var dataMap = {};
    for (var i = start; i<=end; i++) {
        dataMap[i] = this.allData[i];
    }
    if (!this.callback) {
        console.warn('callback is not provided');
        return;
    }
    this.callback(dataMap);
};

MockServer.prototype.getRowCount = function() {
    return this.allData.length;
};
