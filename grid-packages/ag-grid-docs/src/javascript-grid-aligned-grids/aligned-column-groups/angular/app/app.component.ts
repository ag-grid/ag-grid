import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AllCommunityModules } from '@ag-grid-community/all-modules';

import "@ag-grid-community/all-modules/dist/styles/ag-grid.css";
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";

@Component({
    selector: 'my-app',
    template: `
        <ag-grid-angular
                style="width: 100%; height: 45%"
                #topGrid
                class="ag-theme-alpine"
                (firstDataRendered)="onFirstDataRendered($event)"
                [defaultColDef]="{
            resizable: true
        }"
                [rowData]="rowData"
                [modules]="modules"
                [gridOptions]="topOptions"
                [columnDefs]="columnDefs">
        </ag-grid-angular>

        <div style="height: 5%"></div>

        <ag-grid-angular
                style="width: 100%; height: 45%"
                #bottomGrid
                class="ag-theme-alpine"
                (firstDataRendered)="onFirstDataRendered($event)"
                [defaultColDef]="{
            resizable: true
        }"
                [rowData]="rowData"
                [modules]="modules"
                [gridOptions]="bottomOptions"
                [columnDefs]="columnDefs">
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
    modules = AllCommunityModules;

    @ViewChild('topGrid') topGrid;
    @ViewChild('bottomGrid') bottomGrid;

    constructor(private http: HttpClient) {
        this.columnDefs = [
            {
                headerName: "<span style='background-color: lightblue'>Group 1</span>",
                groupId: 'Group1',
                children: [
                    { field: 'athlete', pinned: true, width: 100 },
                    { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                    { field: 'country', width: 100 },
                    { field: 'year', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 }
                ]
            },
            {
                headerName: "<span style='background-color: lightgreen'>Group 2</span>",
                groupId: 'Group2',
                children: [
                    { field: 'athlete', pinned: true, width: 100 },
                    { field: 'age', pinned: true, columnGroupShow: 'open', width: 100 },
                    { field: 'country', width: 100 },
                    { field: 'year', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 },
                    { field: 'date', width: 100 },
                    { field: 'sport', columnGroupShow: 'open', width: 100 }
                ]
            }
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json')
            .subscribe(data => {
                this.rowData = data;

                // mix up some columns
                this.topGrid.columnApi.moveColumnByIndex(11, 4);
                this.topGrid.columnApi.moveColumnByIndex(11, 4);
            });
    }

    onFirstDataRendered(params) {
        this.topGrid.api.sizeColumnsToFit();
    }
}
