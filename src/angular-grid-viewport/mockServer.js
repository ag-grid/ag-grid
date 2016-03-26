function MockServer() {
    this.connections = {};
    this.nextConnectionId = 0;
    setInterval( this.periodicallyUpdateData.bind(this), 100 );
}

MockServer.prototype.periodicallyUpdateData = function() {

    var columnIds = ['gold','silver','bronze'];

    var changes = [];

    // randomly update data for some rows
    for (var i = 0; i<100; i++) {
        var index = Math.floor(this.allData.length * Math.random());
        var columnId = columnIds[i%3];
        var dataItem = this.allData[index];
        var move = Math.floor(3 * Math.random()) - 1;
        var newValue = dataItem[columnId] + move;
        dataItem[columnId] = newValue;

        changes.push({
            rowIndex: index,
            columnId: columnId,
            newValue: newValue
        });
    }

    // inform the connections of the changes where appropriate
    var that = this;
    Object.keys(this.connections).forEach( function(connectionId) {
        var connection = that.connections[connectionId];
        var changesThisConnection = [];
        changes.forEach( function(change) {
            var changeInRange = change.rowIndex >= connection.firstRow && change.rowIndex <= connection.lastRow;
            if (changeInRange) {
                changesThisConnection.push(change);
            }
        });
        // send msg to this connection if one or more changes
        if (changesThisConnection.length > 0) {
            that.sendEventAsync(
                connectionId, { eventType: 'dataUpdated', changes: changesThisConnection }
            );
        }
    });
};

MockServer.prototype.init = function(allData) {
    this.allData = allData;
};

MockServer.prototype.connect = function(listener) {
    var connectionId = this.nextConnectionId;
    this.nextConnectionId++;
    this.connections[connectionId] = {
        listener: listener,
        firstRow: 0,
        lastRow: -1 // first row after last row, range doesn't exist
    };
    
    this.sendEventAsync(
        connectionId, { eventType: 'rowCountChanged', rowCount: this.allData.length }
    );

    return connectionId;
};

// pretend we are on a network, send message to client after 100ms
MockServer.prototype.sendEventAsync = function(connectionId, event) {
    var listener = this.connections[connectionId].listener;
    setTimeout( function() {
        listener(event);
    }, 100);
};

MockServer.prototype.disconnect = function(connectionId) {
    delete this.connections[connectionId];
};

MockServer.prototype.setViewportRange = function(connectionId, firstRow, lastRow) {
    var connection = this.connections[connectionId];
    connection.firstRow = firstRow;
    connection.lastRow = lastRow;

    this.sendResultsToClient(connectionId, firstRow, lastRow);
};

MockServer.prototype.sendResultsToClient = function(connectionId, firstRow, lastRow) {
    if (firstRow < 0 || lastRow < firstRow) {
        console.warn('start or end is not valid');
        return;
    }

    // the map contains row indexes mapped to rows
    var rowDataMap = {};
    for (var i = firstRow; i<=lastRow; i++) {
        rowDataMap[i] = this.allData[i];
    }

    this.sendEventAsync(
        connectionId, { eventType: 'rowData', rowDataMap: rowDataMap }
    );
};

MockServer.prototype.getRowCount = function() {
    return this.allData.length;
};
