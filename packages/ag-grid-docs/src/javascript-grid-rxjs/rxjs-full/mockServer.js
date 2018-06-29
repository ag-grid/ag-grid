function MockServer() {
    "use strict";
    this.rowData = [];
}

// provides the initial (or current state) of the data
MockServer.prototype.initialLoad = function () {
    return Rx.Observable.fromPromise(new Promise((resolve, reject) => {
        // do http request to get our sample data - not using any framework to keep the example self contained.
        // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://rawgit.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/stocks.json');
        httpRequest.send();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                let dataSet = JSON.parse(httpRequest.responseText);

                // for this demo's purpose, lets cut the data set down to something small
                let reducedDataSet = dataSet.slice(0, 200);

                // the sample data has just name and code, we need to add in dummy figures
                this.rowData = this.backfillData(reducedDataSet);
                resolve(_.cloneDeep(this.rowData));
            }
        };
    }));
};

// provides randomised data updates to some of the rows
// only returns the changed data rows
MockServer.prototype.byRowupdates = function () {
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

// provides randomised data updates to some of the rows
// only all the row data (with some rows changed)
MockServer.prototype.allDataUpdates = function () {
    return Rx.Observable.create((observer) => {
        const interval = setInterval(() => {
            let changes = [];

            // make some mock changes to the data
            this.makeSomePriceChanges(changes);
            this.makeSomeVolumeChanges(changes);

            // this time we don't care about the delta changes only
            // this time we return the full data set which has changed rows within it
            observer.next(_.cloneDeep(this.rowData));
        }, 1000);

        return () => clearInterval(interval);
    });
}


/*
 * The rest of the code exists to create or modify mock data
 * it is not important to understand the rest of the example (i.e. the rxjs part of it)
 */
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

MockServer.prototype.makeSomeVolumeChanges = function (changes) {
    for (let i = 0; i < 10; i++) {
        // pick a data item at random
        const index = Math.floor(this.rowData.length * Math.random());

        const currentRowData = this.rowData[index];

        // change by a value between -5 and 5
        const move = (Math.floor(10 * Math.random())) - 5;
        const newValue = currentRowData.volume + move;
        currentRowData.volume = newValue;

        changes.push(currentRowData);
    }
};

MockServer.prototype.makeSomePriceChanges = function (changes) {
    // randomly update data for some rows
    for (let i = 0; i < 10; i++) {
        const index = Math.floor(this.rowData.length * Math.random());

        const currentRowData = this.rowData[index];

        // change by a value between -1 and 2 with one decimal place
        const move = (Math.floor(30 * Math.random())) / 10 - 1;
        const newValue = currentRowData.mid + move;
        currentRowData.mid = newValue;

        this.setBidAndAsk(currentRowData);

        changes.push(currentRowData);
    }
};

MockServer.prototype.setBidAndAsk = function (dataItem) {
    dataItem.bid = dataItem.mid * 0.98;
    dataItem.ask = dataItem.mid * 1.02;
};