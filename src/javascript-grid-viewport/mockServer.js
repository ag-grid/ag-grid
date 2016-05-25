function MockServer() {
    this.connections = {};
    this.nextConnectionId = 0;
    setInterval( this.periodicallyUpdateData.bind(this), 100 );
}

MockServer.prototype.periodicallyUpdateData = function() {

    // keep a record of all the items that changed
    var changes = [];

    // make some mock changes to the data
    this.makeSomePriceChanges(changes);
    this.makeSomeVolumeChanges(changes);

    // inform the connections of the changes where appropriate
    this.informConnectionsOfChanges(changes);
};

MockServer.prototype.informConnectionsOfChanges = function(changes) {
    var that = this;
    // go through each connection
    Object.keys(this.connections).forEach( function(connectionId) {
        var connection = that.connections[connectionId];
        // create a list of changes that are applicable to this connection only
        var changesThisConnection = [];
        changes.forEach( function(change) {
            // see if the index of this change is within the connections viewport
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

MockServer.prototype.makeSomeVolumeChanges = function(changes) {
    for (var i = 0; i<10; i++) {
        // pick a data item at random
        var index = Math.floor(this.allData.length * Math.random());
        var dataItem = this.allData[index];

        // change by a value between -5 and 5
        var move = (Math.floor(10 * Math.random())) - 5;
        var newValue = dataItem.volume + move;
        dataItem.volume = newValue;

        changes.push({
            rowIndex: index,
            columnId: 'volume',
            newValue: dataItem.volume
        });
    }
};

MockServer.prototype.makeSomePriceChanges = function(changes) {
    // randomly update data for some rows
    for (var i = 0; i<10; i++) {
        var index = Math.floor(this.allData.length * Math.random());

        var dataItem = this.allData[index];
        // change by a value between -1 and 2 with one decimal place
        var move = (Math.floor(30 * Math.random()))/10 - 1;
        var newValue = dataItem.mid + move;
        dataItem.mid = newValue;

        this.setBidAndAsk(dataItem);

        changes.push({
            rowIndex: index,
            columnId: 'mid',
            newValue: dataItem.mid
        });
        changes.push({
            rowIndex: index,
            columnId: 'bid',
            newValue: dataItem.bid
        });
        changes.push({
            rowIndex: index,
            columnId: 'ask',
            newValue: dataItem.ask
        });
    }
};

MockServer.prototype.init = function(allData) {
    this.allData = allData;

    // the sample data has just name and code, we need to add in dummy figures
    var that = this;
    this.allData.forEach( function(dataItem) {

        // have volume a random between 100 and 10,000
        dataItem.volume = Math.floor( (Math.random() * 10000) + 100);

        // have mid random from 20 to 300
        dataItem.mid = (Math.random() * 300) + 20;

        that.setBidAndAsk(dataItem);
    });
};

MockServer.prototype.setBidAndAsk = function(dataItem) {
    dataItem.bid = dataItem.mid * 0.98;
    dataItem.ask = dataItem.mid * 1.02;
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

// pretend we are on a network, send message to client after 20ms
MockServer.prototype.sendEventAsync = function(connectionId, event) {
    var listener = this.connections[connectionId].listener;
    setTimeout( function() {
        listener(event);
    }, 20);
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
