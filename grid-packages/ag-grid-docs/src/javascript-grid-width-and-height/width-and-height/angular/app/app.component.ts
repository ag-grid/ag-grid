import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

@Component({
    selector: 'my-app',
    template: `
        <div style='height: 100%; display: flex; flex-direction: column;'>
            <div style="margin-bottom: 5px;">
                <button (click)="fillLarge()">Fill 100%</button>
                <button (click)="fillMedium()">Fill 60%</button>
                <button (click)="fillExact()">Exactly 400 x 400 pixels</button>
            </div>
            <div [ngStyle]="style" >
                <ag-grid-angular
                        style="width: 100%; height:100%;"
                        #agGrid
                        class="ag-theme-alpine"
                        [rowData]="rowData"
                        [columnDefs]="columnDefs"
                        [modules]="modules"
                >
                </ag-grid-angular>
            </div>
        </div>
    `
})
export class AppComponent {
    columnDefs;
    rowData;
    style = {
        width: '100%',
        height: '100%',
        flex: '1 1 auto'
    };
    modules = [ClientSideRowModelModule];

    @ViewChild('agGrid') agGrid;

    constructor(private http: HttpClient) {
        this.columnDefs = [
            { field: "athlete", width: 150 },
            { field: "age", width: 90 },
            { field: "country", width: 150 },
            { field: "year", width: 90 },
            { field: "date", width: 150 },
            { field: "sport", width: 150 },
            { field: "gold", width: 100 },
            { field: "silver", width: 100 },
            { field: "bronze", width: 100 },
            { field: "total", width: 100 },
        ];
    }

    ngOnInit() {
        this.http.get('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json')
            .subscribe(data => {
                this.rowData = data;
            });
    }

    fillLarge() {
        this.setWidthAndHeight('100%', '100%');
    }

    fillMedium() {
        this.setWidthAndHeight('60%', '60%');
    }

    fillExact() {
        this.setWidthAndHeight('400px', '400px');
    }

    setWidthAndHeight(width, height) {
        this.style = {
            marginTop: '20px',
            width: width,
            height: height
        };
    }
}
