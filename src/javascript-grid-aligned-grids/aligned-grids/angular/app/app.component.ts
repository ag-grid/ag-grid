import {Component, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'my-app',
    template: `

<div style="height: 5%">
    <label><input type="checkbox" checked (change)="onCbAthlete($event.target.checked)"/>Athlete</label>
    <label><input type="checkbox" checked (change)="onCbAge($event.target.checked)"/>Age</label>
    <label><input type="checkbox" checked (change)="onCbCountry($event.target.checked)"/>Country</label>
</div>

            <ag-grid-angular
            style="width: 100%; height: 45%"
            #topGrid
            class="ag-fresh"
            [rowData]="rowData"
            [gridOptions]="topOptions"
            [columnDefs]="columnDefs">
            </ag-grid-angular>

            <ag-grid-angular
            style="width: 100%; height: 45%"
            #bottomGrid
            class="ag-fresh"
            [rowData]="rowData"
            [gridOptions]="bottomOptions"
            [columnDefs]="columnDefs">
            </ag-grid-angular>
    `
})
export class AppComponent {
    columnDefs;
    rowData;
    topOptions = { alignedGrids: [] };
    bottomOptions = { alignedGrids: [] };

    @ViewChild('topGrid') topGrid;
    @ViewChild('bottomGrid') bottomGrid;

    constructor(private http: HttpClient) {
        this.columnDefs = [
            {headerName: 'Athlete', field: 'athlete', width: 200},
            {headerName: 'Age', field: 'age', width: 150},
            {headerName: 'Country', field: 'country', width: 150},
            {headerName: 'Year', field: 'year', width: 120},
            {headerName: 'Date', field: 'date', width: 150},
            {headerName: 'Sport', field: 'sport', width: 150}
        ];

        this.topOptions.alignedGrids.push(this.bottomOptions);
        this.bottomOptions.alignedGrids.push(this.topOptions);
    }

    ngOnInit() {
        this.http.get('https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json').subscribe(data => {
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

    onGridReady(params) {
        params.api.sizeColumnsToFit();
    }
}
