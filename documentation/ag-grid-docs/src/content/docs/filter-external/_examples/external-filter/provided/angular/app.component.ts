import { Component, type OnInit, computed, signal } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, IDateFilterParams, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ExternalFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';

import type { IOlympicData } from './interfaces';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ExternalFilterModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    NumberFilterModule,
    DateFilterModule,
]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="test-container">
            <div class="test-header">
                <label>
                    <input type="radio" name="filter" id="everyone" checked (change)="onAgeTypeChanged('everyone')" />
                    Everyone
                </label>
                <label>
                    <input type="radio" name="filter" id="below25" (change)="onAgeTypeChanged('below25')" />
                    Below 25
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        id="between25and50"
                        (change)="onAgeTypeChanged('between25and50')"
                    />
                    Between 25 and 50
                </label>
                <label>
                    <input type="radio" name="filter" id="above50" (change)="onAgeTypeChanged('above50')" />
                    Above 50
                </label>
                <label>
                    <input type="radio" name="filter" id="dateAfter2008" (change)="onAgeTypeChanged('dateAfter2008')" />
                    After 01/01/2008
                </label>
            </div>
            <ag-grid-angular
                style="width: 100%; height: 100%;"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [rowData]="rowData()"
                [isExternalFilterPresent]="isExternalFilterPresent()"
                [doesExternalFilterPass]="doesExternalFilterPass()"
            />
        </div>
    `,
})
export class AppComponent implements OnInit {
    public ageType = signal('everyone');
    public rowData = signal<IOlympicData[] | null>(null);

    public dateFilterParams: IDateFilterParams = {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            const cellDate = this.asDate(cellValue);

            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            }
            return 0;
        },
    };

    public columnDefs: ColDef<IOlympicData>[] = [
        { field: 'athlete', minWidth: 180 },
        { field: 'age', filter: 'agNumberColumnFilter', maxWidth: 80 },
        { field: 'country' },
        { field: 'year', maxWidth: 90 },
        {
            field: 'date',
            filter: 'agDateColumnFilter',
            filterParams: this.dateFilterParams,
        },
        { field: 'total', filter: 'agNumberColumnFilter' },
    ];

    public defaultColDef: ColDef = {
        flex: 1,
        minWidth: 120,
        filter: true,
    };

    // Each computed produces a new function reference whenever ageType changes, and the grid
    // re-runs external filtering as soon as it is given one.
    public isExternalFilterPresent = computed(() => {
        const ageType = this.ageType();
        return (): boolean => ageType !== 'everyone';
    });

    public doesExternalFilterPass = computed(() => {
        const ageType = this.ageType();
        return (node: IRowNode<IOlympicData>): boolean => {
            if (node.data) {
                switch (ageType) {
                    case 'below25':
                        return node.data.age < 25;
                    case 'between25and50':
                        return node.data.age >= 25 && node.data.age <= 50;
                    case 'above50':
                        return node.data.age > 50;
                    case 'dateAfter2008':
                        return this.asDate(node.data.date) > new Date(2008, 0, 1);
                    default:
                        return true;
                }
            }
            return true;
        };
    });

    public ngOnInit() {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data: IOlympicData[]) => this.rowData.set(data));
    }

    public onAgeTypeChanged(newValue: string) {
        this.ageType.set(newValue);
    }

    private asDate(dateAsString: string): Date {
        const splitFields = dateAsString.split('/');
        return new Date(
            Number.parseInt(splitFields[2]),
            Number.parseInt(splitFields[1]) - 1,
            Number.parseInt(splitFields[0])
        );
    }
}
