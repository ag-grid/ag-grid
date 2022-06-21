import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { GridOptions, ValueFormatterParams } from "@ag-grid-community/core";
import { Component } from "@angular/core";
import { MockServerService } from "./mockServer.service";
import { Observable } from "rxjs";

@Component({
    selector: 'my-app',
    template: `
    <h2>Only Row Updates Supplied</h2>
    <ag-grid-angular style="width: 100%; height: 330px;" class="ag-theme-alpine"
                 [gridOptions]="gridOptions"
                 [modules]="modules">
    </ag-grid-angular>
    `,
    providers: [MockServerService]
})
export class RxJsComponentByRow {
    gridOptions: GridOptions;
    initialRowDataLoad$: Observable<any[]>;
    rowDataUpdates$: Observable<any[]>;
    modules = [ClientSideRowModelModule];

    constructor(mockServerService: MockServerService) {
        this.initialRowDataLoad$ = mockServerService.initialLoad();
        this.rowDataUpdates$ = mockServerService.byRowUpdates();

        this.gridOptions = {
            enableRangeSelection: true,
            columnDefs: this.createColumnDefs(),
            getRowId: (params) => {
                // the code is unique, so perfect for the id
                return params.data.code;
            },
            onGridReady: () => {
                this.initialRowDataLoad$.subscribe(
                    (rowData: any[]) => {
                        // the initial full set of data
                        // note that we don't need to un-subscribe here as it's a one off data load
                        if (this.gridOptions.api) { // can be null when tabbing between the examples
                            this.gridOptions.api.setRowData(rowData);
                        }

                        // now listen for updates
                        // we process the updates with a transaction - this ensures that only the changes
                        // rows will get re-rendered, improving performance
                        this.rowDataUpdates$.subscribe((updates: any) => {
                            if (this.gridOptions.api) { // can be null when tabbing between the examples
                                this.gridOptions.api.applyTransaction({ update: updates })
                            }
                        });
                    }
                );
            },

            onFirstDataRendered(params) {
                params.api.sizeColumnsToFit();
            }
        };
    }

    private createColumnDefs() {
        return [
            { headerName: "Code", field: "code", width: 70, resizable: true },
            { headerName: "Name", field: "name", width: 280, resizable: true },
            {
                headerName: "Bid", field: "bid", width: 100, resizable: true,
                cellClass: 'cell-number',
                valueFormatter: this.numberFormatter,
                cellRenderer: 'agAnimateShowChangeCellRenderer'
            },
            {
                headerName: "Mid", field: "mid", width: 100, resizable: true,
                cellClass: 'cell-number',
                valueFormatter: this.numberFormatter,
                cellRenderer: 'agAnimateShowChangeCellRenderer'
            },
            {
                headerName: "Ask", field: "ask", width: 100, resizable: true,
                cellClass: 'cell-number',
                valueFormatter: this.numberFormatter,
                cellRenderer: 'agAnimateShowChangeCellRenderer'
            },
            {
                headerName: "Volume", field: "volume", width: 100, resizable: true,
                cellClass: 'cell-number',
                cellRenderer: 'agAnimateSlideCellRenderer'
            }
        ]
    }

    numberFormatter(params: ValueFormatterParams) {
        if (typeof params.value === 'number') {
            return params.value.toFixed(2);
        } else {
            return params.value;
        }
    }
}
