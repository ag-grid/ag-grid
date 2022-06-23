import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ColDef, GridOptions, ModuleRegistry, ValueFormatterParams } from "@ag-grid-community/core";
import { Component } from "@angular/core";
import { MockServerService } from "./mockServer.service";
import { Observable } from "rxjs";

ModuleRegistry.registerModules([ClientSideRowModelModule]);
@Component({
    selector: 'my-app',
    template: `
    <h2>Full Data Set With Updates Within Supplied</h2>
    <ag-grid-angular style="width: 100%; height: 330px;" class="ag-theme-alpine" [gridOptions]="gridOptions">
    </ag-grid-angular>`,
    providers: [MockServerService]
})
export class RxJsComponentByFullSet {
    gridOptions: GridOptions;
    initialRowDataLoad$: Observable<any[]>;
    rowDataUpdates$: Observable<any[]>;

    constructor(mockServerService: MockServerService) {
        this.initialRowDataLoad$ = mockServerService.initialLoad();
        this.rowDataUpdates$ = mockServerService.allDataUpdates();

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
                        // we're using immutableData this time, so although we're setting the entire
                        // data set here, the grid will only re-render changed rows, improving performance
                        this.rowDataUpdates$.subscribe((newRowData: any[]) => {
                            if (this.gridOptions.api) { // can be null when tabbing between the examples
                                this.gridOptions.api.setRowData(newRowData)
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

    private createColumnDefs(): ColDef[] {
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
