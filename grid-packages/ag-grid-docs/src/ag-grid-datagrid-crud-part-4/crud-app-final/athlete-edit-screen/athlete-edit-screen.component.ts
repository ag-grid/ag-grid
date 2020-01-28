import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ColDef, ColumnApi, GridApi} from 'ag-grid-community';
import {StaticDataService} from '../services/static-data.service';
import {Result} from '../model/result.model';
import {Sport} from '../model/sport.model';
import {Country} from '../model/country.model';
import {Athlete} from '../model/athlete.model';

@Component({
    selector: 'app-athlete-edit-screen',
    templateUrl: './athlete-edit-screen.component.html',
    styleUrls: ['./athlete-edit-screen.component.css']
})
export class AthleteEditScreenComponent implements OnInit {
    // gridApi and columnApi
    private api: GridApi;
    private columnApi: ColumnApi;

    // static data
    private sports: Sport[];
    private countries: Country[];

    // interim/form data
    private name: string;
    private country: Country;
    private rowData: Result[] = [];

    // the results sub-table columns
    private columnDefs: ColDef[];

    @Input() containerCoords: any = null;
    @Input() athlete: Athlete = null;
    @Output() onAthleteSaved = new EventEmitter<Athlete>();

    // to position this component relative to the containing component
    @ViewChild('panel', {read: ElementRef}) public panel;
    private width: any;
    private left: any;
    private top: any;

    constructor(staticDataService: StaticDataService) {
        staticDataService.countries().subscribe(
            countries => this.countries = countries.sort(StaticDataService.alphabeticalSort()),
            error => console.log(error)
        );

        staticDataService.sports().subscribe(
            sports => {
                // store reference to sports, after sorting alphabetically
                this.sports = sports.sort(StaticDataService.alphabeticalSort());

                // create the column defs
                this.columnDefs = this.createColumnDefs(this.sports)
            },
            error => console.log(error)
        );
    }

    ngOnInit() {
        this.setPanelCoordinates();

        if (this.athlete) {
            this.name = this.athlete.name;
            this.country = this.athlete.country;
            this.rowData = this.athlete.results.slice(0);
        }
    }

    countryComparator(c1: Country, c2: Country): boolean {
        return c1 && c2 ? c1.id === c2.id : false;
    }

    insertNewResult() {
        // insert a blank new row, providing the first sport as a default in the sport column
        const updates = this.api.updateRowData(
            {
                add: [{
                    sport: this.sports[0]
                }]
            }
        );

        this.api.startEditingCell({
            rowIndex: updates.add[0].rowIndex,
            colKey: 'age'
        });
    }

    isValidAthlete() {
        return this.name && this.name !== '' &&
            this.country;
    }

    saveAthlete() {
        const athlete = new Athlete();

        athlete.id = this.athlete ? this.athlete.id : null;
        athlete.version = this.athlete ? this.athlete.version : undefined;
        athlete.name = this.name;
        athlete.country = this.country;

        athlete.results = [];
        this.api.forEachNode((node) => {
            const {data} = node;
            athlete.results.push(<Result> {
                id: data.id,
                version: data.version,
                age: data.age,
                year: data.year,
                date: data.date,
                bronze: data.bronze,
                silver: data.silver,
                gold: data.gold,
                sport: data.sport
            });
        });

        this.onAthleteSaved.emit(athlete);
    }

    onGridReady(params): void {
        this.api = params.api;
        this.columnApi = params.columnApi;

        this.api.sizeColumnsToFit();

        // temp fix until AG-1181 is fixed
        this.api.hideOverlay();
    }

    // create some simple column definitions
    private createColumnDefs(sports: Sport[]) {
        return [
            {
                field: 'age',
                editable: true
            },
            {
                field: 'year',
                editable: true
            },
            {
                field: 'date',
                editable: true
            },
            {
                field: 'bronze',
                editable: true
            },
            {
                field: 'silver',
                editable: true
            },
            {
                field: 'gold',
                editable: true
            },
            {
                field: 'sport',
                cellRenderer: (params) => params.data.sport.name,
                editable: true,
                cellEditor: 'richSelect',
                cellEditorParams: {
                    values: sports,
                    cellRenderer: (params) => params.value.name
                }
            }
        ]
    }

    private setPanelCoordinates() {
        // make our width 100pixels smaller than the container
        this.width = (this.containerCoords.width - 100);

        // set our left position to be the container left position plus half the difference in widths between this
        // component and the container, minus the 15px padding
        this.left = Math.floor(this.containerCoords.left + (this.containerCoords.width - this.width) / 2 - 15) + 'px';

        // set our left position to be the container top position plus half the difference in height between this
        // component and the container
        this.top = Math.floor(this.containerCoords.top + (this.containerCoords.height - this.panel.nativeElement.offsetHeight) / 2) + 'px';

        // add the px suffix back in (omitted above so that maths can work)
        this.width = this.width + 'px'
    }
}
