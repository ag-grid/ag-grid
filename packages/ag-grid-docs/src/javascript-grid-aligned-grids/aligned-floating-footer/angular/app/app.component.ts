import {Component, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'my-app',
    styles: [`.bold-row { font-weight: bold; } `],
    template: `

<div style="padding-bottom: 2px;">
    <button (click)="btSizeColsToFix()">Size Cols to Fit</button>
</div>

            <ag-grid-angular
            style="width: 100%; height: 420px"
            #topGrid
            class="ag-theme-balham"
            [rowData]="rowData"
            [gridOptions]="topOptions"
            [columnDefs]="columnDefs">
            </ag-grid-angular>

            <ag-grid-angular
            style="width: 100%; height: 40px"
            #bottomGrid
            class="ag-theme-balham"
            [rowData]="bottomData"
            [gridOptions]="bottomOptions"
            headerHeight="0"
            [rowStyle]="{ fontWeight: 'bold' }"
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

    bottomData = [
        {
            athlete: 'Total',
            age: '15 - 61',
            country: 'Ireland',
            year: '2020',
            date: '26/11/1970',
            sport: 'Synchronised Riding',
            gold: 55,
            silver: 65,
            bronze: 12
        }
    ];

    constructor(private http: HttpClient) {
        this.columnDefs = [
            {headerName: 'Athlete', field: 'athlete', width: 200},
            {headerName: 'Age', field: 'age', width: 100},
            {headerName: 'Country', field: 'country', width: 150},
            {headerName: 'Year', field: 'year', width: 120},
            {headerName: 'Sport', field: 'sport', width: 200},
            // in the total col, we have a value getter, which usually means we don't need to provide a field
            // however the master/slave depends on the column id (which is derived from the field if provided) in
            // order ot match up the columns
            {
                headerName: 'Total',
                field: 'total',
                valueGetter: 'data.gold + data.silver + data.bronze',
                width: 200
            },
            {headerName: 'Gold', field: 'gold', width: 100},
            {headerName: 'Silver', field: 'silver', width: 100},
            {headerName: 'Bronze', field: 'bronze', width: 100}
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json').subscribe(data => {
            this.rowData = data;
        });
    }

    btSizeColsToFix() {
        this.topGrid.api.sizeColumnsToFit();
        console.log('btSizeColsToFix ');
    }
    onGridReady(params) {
        params.api.sizeColumnsToFit();
    }
}
