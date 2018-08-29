import {Component, OnInit} from '@angular/core';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';
import {AthleteService} from '../services/athlete.service';
import {Athlete} from '../model/athlete.model';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
    // row data and column definitions
    private rowData: Athlete[];
    private columnDefs: ColDef[];

    // gridApi and columnApi
    private api: GridApi;
    private columnApi: ColumnApi;

    // inject the athleteService
    constructor(private athleteService: AthleteService) {
        this.columnDefs = this.createColumnDefs();
    }

    // on init, subscribe to the athelete data
    ngOnInit() {
        this.athleteService.findAll().subscribe(
            athletes => {
                this.rowData = athletes
            },
            error => {
                console.log(error);
            }
        )
    }

    // one grid initialisation, grap the APIs and auto resize the columns to fit the available space
    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.api.sizeColumnsToFit();
    }

    // create some simple column definitions
    private createColumnDefs() {
        return [
            {field: 'id'},
            {field: 'name'},
            {field: 'country', valueGetter: (params) => params.data.country.name},
            {field: 'results', valueGetter: (params) => params.data.results.length}
        ]
    }
}
