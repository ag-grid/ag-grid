export function createMockServer() {
    class MockServer {
        constructor() {
            this.connections = {};
            this.nextConnectionId = 0;
            setInterval(this.periodicallyUpdateData.bind(this), 100);
        }

        periodicallyUpdateData() {
            // keep a record of all the items that changed
            const changes = [];

            // make some mock changes to the data
            this.makeSomePriceChanges(changes);
            this.makeSomeVolumeChanges(changes);

            // inform the connections of the changes where appropriate
            this.informConnectionsOfChanges(changes);
        }

        informConnectionsOfChanges(changes) {
            const that = this;
            // go through each connection
            Object.keys(this.connections).forEach(function (connectionId) {
                const connection = that.connections[connectionId];
                // create a list of changes that are applicable to this connection only
                const changesThisConnection = [];
                changes.forEach(function (change) {
                    // see if the index of this change is within the connections viewport
                    const changeInRange =
                        change.rowIndex >= connection.firstRow && change.rowIndex <= connection.lastRow;
                    if (changeInRange) {
                        changesThisConnection.push(change);
                    }
                });
                // send msg to this connection if one or more changes
                if (changesThisConnection.length > 0) {
                    that.sendEventAsync(connectionId, {
                        eventType: 'dataUpdated',
                        changes: changesThisConnection,
                    });
                }
            });
        }

        makeSomeVolumeChanges(changes) {
            for (let i = 0; i < 10; i++) {
                // pick a data item at random
                const index = Math.floor(this.allData.length * pRandom());
                const dataItem = this.allData[index];

                // change by a value between -5 and 5
                const move = Math.floor(10 * pRandom()) - 5;
                const newValue = dataItem.volume + move;
                dataItem.volume = newValue;

                changes.push({
                    rowIndex: index,
                    columnId: 'volume',
                    newValue: dataItem.volume,
                });
            }
        }

        makeSomePriceChanges(changes) {
            // randomly update data for some rows
            for (let i = 0; i < 10; i++) {
                const index = Math.floor(this.allData.length * pRandom());

                const dataItem = this.allData[index];
                // change by a value between -1 and 2 with one decimal place
                const move = Math.floor(30 * pRandom()) / 10 - 1;
                const newValue = dataItem.mid + move;
                dataItem.mid = newValue;

                this.setBidAndAsk(dataItem);

                changes.push({
                    rowIndex: index,
                    columnId: 'mid',
                    newValue: dataItem.mid,
                });
                changes.push({
                    rowIndex: index,
                    columnId: 'bid',
                    newValue: dataItem.bid,
                });
                changes.push({
                    rowIndex: index,
                    columnId: 'ask',
                    newValue: dataItem.ask,
                });
            }
        }

        init(allData) {
            this.allData = allData;

            // the sample data has just name and code, we need to add in dummy figures
            const that = this;
            this.allData.forEach(function (dataItem) {
                // have volume a random between 100 and 10,000
                dataItem.volume = Math.floor(pRandom() * 10000 + 100);

                // have mid random from 20 to 300
                dataItem.mid = pRandom() * 300 + 20;

                that.setBidAndAsk(dataItem);
            });
        }

        setBidAndAsk(dataItem) {
            dataItem.bid = dataItem.mid * 0.98;
            dataItem.ask = dataItem.mid * 1.02;
        }

        connect(listener) {
            const connectionId = this.nextConnectionId;
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
                lastRow: -1, // first row after last row, range doesn't exist
            };

            this.sendEventAsync(connectionId, {
                eventType: 'rowCountChanged',
                rowCount: this.allData.length,
            });

            return connectionId;
        }

        // pretend we are on a network, send message to client after 20ms
        sendEventAsync(connectionId, event) {
            const listener = this.connections[connectionId].listener;
            setTimeout(function () {
                listener(event);
            }, 20);
        }

        disconnect(connectionId) {
            delete this.connections[connectionId];
        }

        setViewportRange(connectionId, firstRow, lastRow) {
            const connection = this.connections[connectionId];
            connection.firstRow = firstRow;
            connection.lastRow = lastRow;

            // because the client has moved its viewport, it will have disregarded rows outside the range
            this.purgeFromClientRows(connection.rowsInClient, firstRow, lastRow);
            // send rows newly in the range
            this.sendResultsToClient(connectionId, firstRow, lastRow);
        }

        // removes any entries outside the viewport (firstRow to lastRow)
        purgeFromClientRows(rowsInClient, firstRow, lastRow) {
            Object.keys(rowsInClient).forEach(function (rowIndexStr) {
                const rowIndex = parseInt(rowIndexStr);
                if (rowIndex < firstRow || rowIndex > lastRow) {
                    delete rowsInClient[rowIndex];
                }
            });
        }

        sendResultsToClient(connectionId, firstRow, lastRow) {
            if (firstRow < 0 || lastRow < firstRow) {
                console.warn('start or end is not valid');
                return;
            }

            // we want to keep track of what rows the client has
            const rowsInClient = this.connections[connectionId].rowsInClient;

            // the map contains row indexes mapped to rows
            const rowDataMap = {};
            for (let i = firstRow; i <= lastRow; i++) {
                // if client already has this row, don't send it again
                if (rowsInClient[i]) {
                    continue;
                }
                // otherwise send the row. we send a copy of the row to mimic
                // going over network, so any further changes to the row in
                // the mock server is not reflected in the grid's copy
                rowDataMap[i] = JSON.parse(JSON.stringify(this.allData[i]));
                // and record that the client has this row
                rowsInClient[i] = true;
            }

            this.sendEventAsync(connectionId, {
                eventType: 'rowData',
                rowDataMap: rowDataMap,
            });
        }

        getRowCount() {
            return this.allData.length;
        }
    }
    return new MockServer();
}

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();
