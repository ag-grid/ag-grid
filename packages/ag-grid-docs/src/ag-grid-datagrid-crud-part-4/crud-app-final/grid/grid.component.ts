import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

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
export class GridComponent {
    // row data and column definitions
    private rowData: Athlete[];
    private columnDefs: ColDef[];

    // gridApi and columnApi
    private api: GridApi;
    private columnApi: ColumnApi;

    private editInProgress: boolean = false;

    private athleteBeingEdited: Athlete = null;
    private containerCoords: {} = null;

    @ViewChild('grid', {read: ElementRef}) public grid;

    // inject the athleteService
    constructor(private athleteService: AthleteService,
                staticDataService: StaticDataService) {

        staticDataService.countries().subscribe(
            countries => this.columnDefs = this.createColumnDefs(countries),
            error => console.log(error)
        );

        this.athleteService.findAll().subscribe(
            athletes => this.rowData = athletes,
            error => console.log(error)
        )
    }

    getRowNodeId(params) {
        return params.id;
    }

    onAthleteSaved(athleteToSave: Athlete) {
        this.athleteService.save(athleteToSave)
            .subscribe(
                savedAthlete => {
                    console.log('Athlete saved', savedAthlete.name);

                    const added = [];
                    const updated = [];
                    if (athleteToSave.id) {
                        updated.push(savedAthlete);
                    } else {
                        added.push(savedAthlete);
                    }

                    this.api.updateRowData(
                        {
                            add: added,
                            update: updated
                        }
                    );
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

        this.updateContainerCoords();
        this.athleteBeingEdited = <Athlete>params.data;
        this.editInProgress = true;
    }

    insertNewRow() {
        this.updateContainerCoords();
        this.editInProgress = true;
    }

    private updateContainerCoords() {
        this.containerCoords = {
            top: this.grid.nativeElement.offsetTop,
            left: this.grid.nativeElement.offsetLeft,
            height: this.grid.nativeElement.offsetHeight,
            width: this.grid.nativeElement.offsetWidth
        };
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

        // then subscribe to these and once all done, update the grid
        Observable.forkJoin(...deleteSubscriptions).subscribe(
            results => {
                // only redraw removed rows...
                this.api.updateRowData(
                    {
                        remove: selectRows
                    }
                );
            }
        );
    }
}
