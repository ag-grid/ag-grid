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
    // keep a record of the connection
    this.connections[connectionId] = {
        // the client callback that receives the events
        listener: listener,
        // we keep track of the rows in the client, so when the viewport changes,
        // we only send rows that are new, eg if viewport is length 10, and moves 2
        // positions, we only send the 2 new rows, as the client already has 8 of them
        rowsInClient: {},
        // keep track of range, so when data items change, we know what to send
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

    // because the client has moved it's viewport, it will have disregarded rows outside the range
    this.purgeFromClientRows(connection.rowsInClient, firstRow, lastRow);
    // send rows newly in the range
    this.sendResultsToClient(connectionId, firstRow, lastRow);
};

// removes any entries outside the viewport (firstRow to lastRow)
MockServer.prototype.purgeFromClientRows = function(rowsInClient, firstRow, lastRow) {
    Object.keys(rowsInClient).forEach( function(rowIndexStr) {
        var rowIndex = parseInt(rowIndexStr);
        if (rowIndex < firstRow || rowIndex > lastRow) {
            delete rowsInClient[rowIndex];
        }
    });
};

MockServer.prototype.sendResultsToClient = function(connectionId, firstRow, lastRow) {
    if (firstRow < 0 || lastRow < firstRow) {
        console.warn('start or end is not valid');
        return;
    }

    // we want to keep track of what rows the client has
    var rowsInClient = this.connections[connectionId].rowsInClient;

    // the map contains row indexes mapped to rows
    var rowDataMap = {};
    for (var i = firstRow; i<=lastRow; i++) {
        // if client already has this row, don't send it again
        if (rowsInClient[i]) { continue; }
        // otherwise send the row
        rowDataMap[i] = this.allData[i];
        // and record that the client has this row
        rowsInClient[i] = true;
    }

    this.sendEventAsync(
        connectionId, { eventType: 'rowData', rowDataMap: rowDataMap }
    );
};

MockServer.prototype.getRowCount = function() {
    return this.allData.length;
};
