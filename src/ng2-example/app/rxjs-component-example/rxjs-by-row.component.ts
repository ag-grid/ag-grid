import {Component} from "@angular/core";

import {GridOptions} from "ag-grid/main";
import {MockServerService} from "./mockServer.service";

@Component({
    moduleId: module.id,
    selector: 'ag-rxjs-by-row-component',
    templateUrl: 'rxjs-by-row.component.html',
    providers: [MockServerService]
})
export class RxJsComponentByRow {
    gridOptions: GridOptions;
    initialRowDataLoad$;
    rowDataUpdates$;

    constructor(mockServerService: MockServerService) {
        this.initialRowDataLoad$ = mockServerService.initialLoad();
        this.rowDataUpdates$ = mockServerService.byRowupdates();

        this.gridOptions = <GridOptions> {
            enableRangeSelection: true,
            enableColResize: true,
            columnDefs: this.createColumnDefs(),
            getRowNodeId: function (data) {
                // the code is unique, so perfect for the id
                return data.code;
            },
            onGridReady: () => {
                this.initialRowDataLoad$.subscribe(
                    rowData => {
                        // the initial full set of data
                        // note that we don't need to un-subscribe here as it's a one off data load
                        this.gridOptions.api.setRowData(rowData);

                        // now listen for updates
                        // we process the updates with a transaction - this ensures that only the changes
                        // rows will get re-rendered, improving performance
                        this.rowDataUpdates$.subscribe((updates) => this.gridOptions.api.updateRowData({update: updates}));
                    }
                );
                this.gridOptions.api.sizeColumnsToFit();
            }
        };
    }

    private createColumnDefs() {
        return [
            {headerName: "Code", field: "code", width: 70},
            {headerName: "Name", field: "name", width: 280},
            {
                headerName: "Bid", field: "bid", width: 100,
                cellClass: 'cell-number',
                cellFormatter: this.numberFormatter,
                cellRenderer: 'animateShowChange'
            },
            {
                headerName: "Mid", field: "mid", width: 100,
                cellClass: 'cell-number',
                cellFormatter: this.numberFormatter,
                cellRenderer: 'animateShowChange'
            },
            {
                headerName: "Ask", field: "ask", width: 100,
                cellClass: 'cell-number',
                cellFormatter: this.numberFormatter,
                cellRenderer: 'animateShowChange'
            },
            {
                headerName: "Volume", field: "volume", width: 100,
                cellClass: 'cell-number',
                cellRenderer: 'animateSlide'
            }
        ]
    }

    numberFormatter(params) {
        if (typeof params.value === 'number') {
            return params.value.toFixed(2);
        } else {
            return params.value;
        }
    }
}