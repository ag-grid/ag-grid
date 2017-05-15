function MockServer() {
    "use strict";
    this.rowData = [];
}

MockServer.prototype.initialLoad = function () {
    return Rx.Observable.fromPromise(new Promise((resolve, reject) => {
        // do http request to get our sample data - not using any framework to keep the example self contained.
        // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', '../stocks.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                let dataSet = JSON.parse(httpRequest.responseText);

                // for this demo's purpose, lets cut the data set down to something small
                let reducedDataSet = dataSet.slice(0, 200);

                // the sample data has just name and code, we need to add in dummy figures
                this.rowData = this.backfillData(reducedDataSet);
                resolve(this.rowData);
            }
        };
    }));
};

MockServer.prototype.backfillData = function (rowData) {
    // the sample data has just name and code, we need to add in dummy figures
    rowData.forEach((dataItem) => {

        // have volume a random between 100 and 10,000
        dataItem.volume = Math.floor((Math.random() * 10000) + 100);

        // have mid random from 20 to 300
        dataItem.mid = (Math.random() * 300) + 20;

        this.setBidAndAsk(dataItem);
    });
    return rowData;
};

MockServer.prototype.updates = function () {
    return Rx.Observable.create((observer) => {
        const interval = setInterval(() => {
            let changes = [];

            // make some mock changes to the data
            this.makeSomePriceChanges(changes);
            this.makeSomeVolumeChanges(changes);
            observer.next(changes);
        }, 1000);

        return () => clearInterval(interval);
    });
};

MockServer.prototype.makeSomeVolumeChanges = function (changes) {
    for (let i = 0; i < 10; i++) {
        // pick a data item at random
        const index = Math.floor(this.rowData.length * Math.random());
        const dataItem = this.rowData[index];

        // change by a value between -5 and 5
        const move = (Math.floor(10 * Math.random())) - 5;
        const newValue = dataItem.volume + move;
        dataItem.volume = newValue;

        changes.push({
            rowIndex: index,
            columnId: 'volume',
            newValue: dataItem.volume
        });
    }
};

MockServer.prototype.makeSomePriceChanges = function (changes) {
    // randomly update data for some rows
    for (let i = 0; i < 10; i++) {
        const index = Math.floor(this.rowData.length * Math.random());

        const dataItem = this.rowData[index];
        // change by a value between -1 and 2 with one decimal place
        const move = (Math.floor(30 * Math.random())) / 10 - 1;
        const newValue = dataItem.mid + move;
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

MockServer.prototype.setBidAndAsk = function (dataItem) {
    dataItem.bid = dataItem.mid * 0.98;
    dataItem.ask = dataItem.mid * 1.02;
};

(function () {

    const columnDefs = [
        // this col shows the row index, doesn't use any data from the row
        {
            headerName: "#", width: 50, cellRenderer: function (params) {
            return params.rowIndex;
        }
        },
        {headerName: "Code", field: "code", width: 70},
        {headerName: "Name", field: "name", width: 300},
        {
            headerName: "Bid", field: "bid", width: 100,
            cellClass: 'cell-number',
            cellFormatter: numberFormatter,
            cellRenderer: 'animateShowChange'
        },
        {
            headerName: "Mid", field: "mid", width: 100,
            cellClass: 'cell-number',
            cellFormatter: numberFormatter,
            cellRenderer: 'animateShowChange'
        },
        {
            headerName: "Ask", field: "ask", width: 100,
            cellClass: 'cell-number',
            cellFormatter: numberFormatter,
            cellRenderer: 'animateShowChange'
        },
        {
            headerName: "Volume", field: "volume", width: 80,
            cellClass: 'cell-number',
            cellRenderer: 'animateSlide'
        }
    ];

    const gridOptions = {
        enableRangeSelection: true,
        enableColResize: true,
        debug: true,
        columnDefs: columnDefs,
        // implement this so that we can do selection
        getRowNodeId: function (data) {
            // the code is unique, so perfect for the id
            return data.code;
        },
        onGridReady: () => {
            "use strict";
            initialLoad$.subscribe(
                rowData => {
                    // the initial full set of data
                    // note that we don't need to un-subscribe here
                    gridOptions.api.setRowData(rowData);

                    // now listen for updates
                    updates$.subscribe(processUpdates)
                }
            );
            gridOptions.api.sizeColumnsToFit();
        }
    };

    function numberFormatter(params) {
        if (typeof params.value === 'number') {
            return params.value.toFixed(2);
        } else {
            return params.value;
        }
    }

    let processUpdates = function (changes) {
        changes.forEach(function (change) {
            const rowNode = gridOptions.api.getModel().getRow(change.rowIndex);
            // if the rowNode is missing, it means the grid is not displaying that row.
            // if the data is missing, it means the rowNode is there, but that data has not
            // loaded into it yet, so to early to set delta changes.
            if (!rowNode || !rowNode.data) {
                return;
            }
            // rowNode.data[change.columnId] = change.newValue;
            // this is a trick, it gets the row to refresh
            rowNode.setDataValue(change.columnId, change.newValue);
        });
    };

    let mockServer = new MockServer();
    const initialLoad$ = mockServer.initialLoad();
    const updates$ = mockServer.updates();

    document.addEventListener('DOMContentLoaded', function () {
        const gridDiv = document.querySelector('#liveStreamExample');
        new agGrid.Grid(gridDiv, gridOptions);
    });
})();


