
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { BodyScrollEndEvent, ColDef, FirstDataRenderedEvent, GridReadyEvent, IServerSideDatasource, PaginationChangedEvent } from '@ag-grid-community/core';
// Required feature modules are registered in app.module.ts
declare var FakeServer: any;

@Component({
    selector: 'my-app',
    template: `
        <button (click)="resetGrid()">Reload Grid</button>
        <div class="grid-wrapper" *ngIf="gridActivated">
            <ag-grid-angular
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine-dark"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [autoGroupColumnDef]="autoGroupColumnDef"
                [rowModelType]="rowModelType"
                [pagination]="true"
                [paginationPageSize]="paginationPageSize"
                [serverSideInitialRowCount]="serverSideInitialRowCount"
                [suppressAggFuncInHeader]="true"
                [animateRows]="true"
                [rowData]="rowData"
                (firstDataRendered)="onFirstDataRendered($event)"
                (gridReady)="onGridReady($event)"
                (paginationChanged)="onPaginationChanged($event)"
                (bodyScrollEnd)="onBodyScrollEnd($event)"
            >
            </ag-grid-angular>
        </div>
    `
})

export class AppComponent {
    public columnDefs: ColDef[] = [
        { field: 'index' },
        { field: 'country' },
        { field: 'athlete', minWidth: 190 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ];
    public defaultColDef: ColDef = {
        flex: 1,
        minWidth: 90,
        resizable: true,
        sortable: true,
    };
    public autoGroupColumnDef: ColDef = {
        flex: 1,
        minWidth: 180,
    };
    public rowModelType: 'clientSide' | 'infinite' | 'viewport' | 'serverSide' = 'serverSide';
    public paginationPageSize = 1000;
    public serverSideInitialRowCount = 5000;
    public initialPageTarget = 4;
    public initialRowTarget = 4500;
    public rowData!: IOlympicData[];
    public initialisedPosition = false;
    private gridActivated: boolean = true;

    constructor(private http: HttpClient) {}

    onFirstDataRendered (event: FirstDataRenderedEvent<IOlympicData>) {
        event.api.paginationGoToPage(this.initialPageTarget);
        event.api.ensureIndexVisible(this.initialRowTarget, 'top');
        this.initialisedPosition = true;
    }

    onBodyScrollEnd (event: BodyScrollEndEvent) {
        if (!this.initialisedPosition) {
            return;
        }
        this.initialRowTarget = event.api.getFirstVisibleRowIndex();
        this.serverSideInitialRowCount = event.api.getDisplayedRowCount();
    }

    onPaginationChanged (event: PaginationChangedEvent) {
        if (!this.initialisedPosition) {
            return;
        }
        this.initialPageTarget = event.api.paginationGetCurrentPage();
    }

    resetGrid() {
        this.initialisedPosition = false;
        this.gridActivated = false;
        setTimeout(() => {
          this.gridActivated = true;
        });
    }

    onGridReady(params: GridReadyEvent<IOlympicData>) {
        this.http.get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json').subscribe(data => {
            const indexedData = data.map((item: IOlympicData, index: number) => ({ ...item, index }));

            // setup the fake server with entire dataset
            var fakeServer = new FakeServer(indexedData);
            // create datasource with a reference to the fake server
            var datasource = getServerSideDatasource(fakeServer);
            // register the datasource with the grid
            params.api!.setServerSideDatasource(datasource);
        });
    }
}

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);
            var response = server.getData(params.request);
            // adding delay to simulate real server call
            setTimeout(function () {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                }
                else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}
