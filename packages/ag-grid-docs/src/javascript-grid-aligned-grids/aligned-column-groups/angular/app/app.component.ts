import {Component, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'my-app',
    template: `
        <ag-grid-angular
        style="width: 100%; height: 45%"
        #topGrid
        class="ag-theme-balham"
        (firstDataRendered)="onFirstDataRendered($event)"
        [rowData]="rowData"
        [gridOptions]="topOptions"
        [columnDefs]="columnDefs">
        </ag-grid-angular>

        <div style="height: 5%"></div>

        <ag-grid-angular
        style="width: 100%; height: 45%"
        #bottomGrid
        class="ag-theme-balham"
        (firstDataRendered)="onFirstDataRendered($event)"
        [rowData]="rowData"
        [gridOptions]="bottomOptions"
        [columnDefs]="columnDefs">
        </ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs;
    rowData;
    topOptions = {alignedGrids: []};
    bottomOptions = {alignedGrids: []};

    @ViewChild('topGrid') topGrid;
    @ViewChild('bottomGrid') bottomGrid;

    constructor(private http: HttpClient) {
        this.columnDefs = [
            {
                headerName: "<span style='background-color: lightblue'>Group 1</span>",
                groupId: 'Group1',
                children: [
                    {headerName: 'AAA', field: 'athlete', pinned: true, width: 100},
                    {headerName: 'BBB', field: 'age', pinned: true, columnGroupShow: 'open', width: 100},
                    {headerName: 'CCC', field: 'country', width: 100},
                    {headerName: 'DDD', field: 'year', columnGroupShow: 'open', width: 100},
                    {headerName: 'EEE', field: 'date', width: 100},
                    {headerName: 'FFF', field: 'sport', columnGroupShow: 'open', width: 100},
                    {headerName: 'GGG', field: 'date', width: 100},
                    {headerName: 'HHH', field: 'sport', columnGroupShow: 'open', width: 100}
                ]
            },
            {
                headerName: "<span style='background-color: lightgreen'>Group 2</span>",
                groupId: 'Group2',
                children: [
                    {headerName: 'AAA', field: 'athlete', pinned: true, width: 100},
                    {headerName: 'BBB', field: 'age', pinned: true, columnGroupShow: 'open', width: 100},
                    {headerName: 'CCC', field: 'country', width: 100},
                    {headerName: 'DDD', field: 'year', columnGroupShow: 'open', width: 100},
                    {headerName: 'EEE', field: 'date', width: 100},
                    {headerName: 'FFF', field: 'sport', columnGroupShow: 'open', width: 100},
                    {headerName: 'GGG', field: 'date', width: 100},
                    {headerName: 'HHH', field: 'sport', columnGroupShow: 'open', width: 100}
                ]
            }
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json').subscribe(data => {
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
