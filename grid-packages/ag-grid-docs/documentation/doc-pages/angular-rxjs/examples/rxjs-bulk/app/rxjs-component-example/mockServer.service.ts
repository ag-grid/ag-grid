import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { map, catchError } from "rxjs/operators";
import { of, throwError, interval } from "rxjs";
@Injectable()
export class MockServerService {
    stocksUrl: string = 'https://www.ag-grid.com/example-assets/stocks.json';
    rowData!: any[];

    constructor(private http: HttpClient) {
    }

    // provides the initial (or current state) of the data
    initialLoad(): any {
        return this.http.get<any[]>(this.stocksUrl).pipe(
            map(r => this.extractData.bind(this)(r)),
            catchError(this.handleError)
        )
    }

    // provides randomised data updates to some of the rows
    // only all the row data (with some rows changed)
    allDataUpdates(): any {
        return interval(1000).pipe(map(() => {
            let changes: any[] = [];

            // make some mock changes to the data
            this.makeSomePriceChanges(changes);
            this.makeSomeVolumeChanges(changes);

            // this time we don't care about the delta changes only
            // this time we return the full data set which has changed rows within it
            // We mimic immutable data by spreading each row item
            return this.rowData.map(r => ({ ...r }));
        }));
    }

    extractData(res: any[]): any {

        let reducedDataSet = res.slice(0, 200);

        // the sample data has just name and code, we need to add in dummy figures
        this.rowData = this.backfillData(reducedDataSet);

        return (this.rowData);
    }

    handleError(error: any): any {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return throwError(errMsg);
    }

    /*
     * The rest of the code exists to create or modify mock data
     * it is not important to understand the rest of the example (i.e. the rxjs part of it)
     */
    backfillData(rowData: any[]): any {
        // the sample data has just name and code, we need to add in dummy figures
        rowData.forEach((dataItem) => {

            // have volume a random between 100 and 10,000
            dataItem.volume = Math.floor((Math.random() * 10000) + 100);

            // have mid random from 20 to 300
            dataItem.mid = (Math.random() * 300) + 20;

            this.setBidAndAsk(dataItem);
        });
        return rowData;
    }

    makeSomeVolumeChanges(changes: any[]): any {
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
    }

    makeSomePriceChanges(changes: any[]): any {
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
    }

    setBidAndAsk(dataItem: any): any {
        dataItem.bid = dataItem.mid * 0.98;
        dataItem.ask = dataItem.mid * 1.02;
    }
}
