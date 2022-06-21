import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef, ColGroupDef, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core';


import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule])

@Component({
    selector: 'my-app',
    template: `
        <ag-grid-angular
                style='width: 100%; height: 45%'
                #topGrid
                class='ag-theme-alpine'
                (firstDataRendered)='onFirstDataRendered($event)'
                [defaultColDef]='{
                    resizable: true
                }'
                [rowData]='rowData'
                [gridOptions]='topOptions'
                [columnDefs]='columnDefs'>
        </ag-grid-angular>

        <div style='height: 5%'></div>

        <ag-grid-angular
                style='width: 100%; height: 45%'
                #bottomGrid
                class='ag-theme-alpine'
                (firstDataRendered)='onFirstDataRendered($event)'
                [defaultColDef]='{
                    resizable: true
                }'
                [rowData]='rowData'
                [gridOptions]='bottomOptions'
                [columnDefs]='columnDefs'>
        </ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs!: (ColDef | ColGroupDef)[];
    rowData!: any[];
    topOptions: GridOptions = {
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
    bottomOptions: GridOptions = {
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

    @ViewChild('topGrid') topGrid: any;
    @ViewChild('bottomGrid') bottomGrid: any;

    constructor(private http: HttpClient) {
        this.columnDefs = [
            {
                headerName: 'Group 1',
                headerClass: 'blue',
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
                headerName: 'Group 2',
                headerClass: 'green',
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

        this.topOptions.alignedGrids!.push(this.bottomOptions);
        this.bottomOptions.alignedGrids!.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe(data => {
                this.rowData = data as any[];

                // mix up some columns
                this.topGrid.columnApi.moveColumnByIndex(11, 4);
                this.topGrid.columnApi.moveColumnByIndex(11, 4);
            });
    }

    onFirstDataRendered(params: FirstDataRenderedEvent) {
        this.topGrid.api.sizeColumnsToFit();
    }
}
