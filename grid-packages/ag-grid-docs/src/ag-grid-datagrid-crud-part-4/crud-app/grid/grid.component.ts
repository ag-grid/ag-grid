import {Component, OnInit} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';
import {AthleteService} from '../services/athlete.service';
import {Athlete} from '../model/athlete.model';
import {StaticDataService} from '../services/static-data.service';
import {Country} from '../model/country.model';

// we need to import this as we're making use of enterprise features, such as the richSelect cell editor
import 'ag-grid-enterprise';

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

    private editInProgress: boolean = false;

    private athleteBeingEdited: Athlete = null;

    // inject the athleteService
    constructor(private athleteService: AthleteService,
                staticDataService: StaticDataService) {

        staticDataService.countries().subscribe(
            countries => this.columnDefs = this.createColumnDefs(countries),
            error => console.log(error)
        );
    }

    // on init, read to the athlete data
    ngOnInit() {
        this.setAthleteRowData();
    }

    setAthleteRowData() {
        this.athleteService.findAll().subscribe(
            athletes => this.rowData = athletes,
            error => console.log(error)
        )
    }

    onAthleteSaved(savedAthlete: Athlete) {
        this.athleteService.save(savedAthlete)
            .subscribe(
                success => {
                    console.log('Athlete saved');
                    this.setAthleteRowData();
                },
                error => console.log(error)
            );

        this.athleteBeingEdited = null;
        this.editInProgress = false;
    }

    // one grid initialisation, grab the APIs and auto resize the columns to fit the available space
    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.api.sizeColumnsToFit();
    }

    // create some simple column definitions
    private createColumnDefs(countries: Country[]) {
        return [
            {
                field: 'name',
                editable: true,
                checkboxSelection: true
            },
            {
                field: 'country',
                cellRenderer: (params) => params.data.country.name,
                editable: true,
                cellEditor: 'richSelect',
                cellEditorParams: {
                    values: countries,
                    cellRenderer: (params) => params.value.name
                }
            },
            {
                field: 'results',
                valueGetter: (params) => params.data.results.length
            }
        ]
    }

    onRowDoubleClicked(params: any) {
        if (this.editInProgress) {
            return;
        }

        this.athleteBeingEdited = <Athlete>params.data;
        this.editInProgress = true;
    }

    insertNewRow() {
        this.editInProgress = true;
    }

    rowsSelected() {
        return this.api && this.api.getSelectedRows().length > 0;
    }

    deleteSelectedRows() {
        const selectRows = this.api.getSelectedRows();

        // create an Observable for each row to delete
        const deleteSubscriptions = selectRows.map((rowToDelete) => {
            return this.athleteService.delete(rowToDelete);
        });

        // then subscribe to these and once all done, refresh the grid data
        Observable.forkJoin(...deleteSubscriptions).subscribe(results => this.setAthleteRowData())
    }
}
