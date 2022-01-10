import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";

@Component({
    selector: 'my-app',
    template: `

        <div class="test-header" style="height: 5%">
            <label><input type="checkbox" checked (change)="onCbAthlete($event.target.checked)"/>Athlete</label>
            <label><input type="checkbox" checked (change)="onCbAge($event.target.checked)"/>Age</label>
            <label><input type="checkbox" checked (change)="onCbCountry($event.target.checked)"/>Country</label>
        </div>

        <ag-grid-angular
                style="width: 100%; height: 45%"
                #topGrid
                class="ag-theme-alpine"
                [rowData]="rowData"
                [gridOptions]="topOptions"
                [modules]="modules"
                [columnDefs]="columnDefs"
                (firstDataRendered)="onFirstDataRendered($event)">
        </ag-grid-angular>

        <ag-grid-angular
                style="width: 100%; height: 45%"
                #bottomGrid
                class="ag-theme-alpine"
                [rowData]="rowData"
                [gridOptions]="bottomOptions"
                [modules]="modules"
                [columnDefs]="columnDefs"
                (firstDataRendered)="onFirstDataRendered($event)">
        </ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs;
    rowData;
    topOptions = {
        alignedGrids: [],
        defaultColDef: {
            editable: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100
        }
    };
    bottomOptions = {
        alignedGrids: [],
        defaultColDef: {
            editable: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100
        }
    };
    modules = [ClientSideRowModelModule];

    @ViewChild('topGrid') topGrid;
    @ViewChild('bottomGrid') bottomGrid;

    constructor(private http: HttpClient) {
        this.columnDefs = [
            { field: 'athlete' },
            { field: 'age' },
            { field: 'country' },
            { field: 'year' },
            { field: 'date' },
            { field: 'sport' },
            {
                headerName: 'Medals',
                children: [
                    {
                        columnGroupShow: 'closed', field: "total",
                        valueGetter: "data.gold + data.silver + data.bronze", width: 200
                    },
                    { columnGroupShow: 'open', field: "gold", width: 100 },
                    { columnGroupShow: 'open', field: "silver", width: 100 },
                    { columnGroupShow: 'open', field: "bronze", width: 100 }
                ]
            }
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe(data => {
                this.rowData = data;
            });
    }

    onCbAthlete(value) {
        // we only need to update one grid, as the other is a slave
        this.topGrid.columnApi.setColumnVisible('athlete', value);
    }

    onCbAge(value) {
        // we only need to update one grid, as the other is a slave
        this.topGrid.columnApi.setColumnVisible('age', value);
    }

    onCbCountry(value) {
        // we only need to update one grid, as the other is a slave
        this.topGrid.columnApi.setColumnVisible('country', value);
    }

    onFirstDataRendered(params) {
        this.topGrid.api.sizeColumnsToFit();
    };

}
