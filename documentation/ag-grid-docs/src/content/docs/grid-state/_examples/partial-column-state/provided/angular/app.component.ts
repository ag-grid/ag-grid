import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi, GridReadyEvent, GridState } from 'ag-grid-community';
import { ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import type { IOlympicData } from './interfaces';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

// Only the column order is supplied; every other column state section is omitted.
const columnOrderState: GridState = {
    columnOrder: {
        orderedColIds: ['gold', 'silver', 'athlete', 'sport', 'country', 'year'],
    },
};

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="example-wrapper">
            <div>
                <span class="button-group">
                    <button (click)="recreateWithNoState()">Recreate: No State</button>
                    <button (click)="recreateWithColumnOrder()">Recreate: Column Order Only</button>
                    <button (click)="recreateWithPartialColumnOrder()">
                        Recreate: Column Order Only + partialColumnState
                    </button>
                </span>
            </div>
            @if (gridVisible()) {
                <ag-grid-angular
                    style="width: 100%; height: 100%;"
                    gridId="partialColumnState"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [grandTotalRow]="'bottom'"
                    [rowData]="rowData"
                    [initialState]="initialState"
                    (gridReady)="onGridReady($event)"
                />
            }
        </div>
    `,
})
export class AppComponent {
    private gridApi!: GridApi<IOlympicData>;

    public columnDefs: ColDef[] = [
        { field: 'athlete' },
        { field: 'country', pinned: 'left' },
        { field: 'year', hide: true },
        { field: 'sport' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
    ];
    public defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
    };
    public rowData?: IOlympicData[];
    public gridVisible = signal(true);
    public initialState?: GridState;

    constructor(private http: HttpClient) {}

    recreateGrid(state?: GridState): void {
        this.gridVisible.set(false);
        console.log('Recreating grid with initialState', state);
        this.initialState = state;
        this.rowData = undefined;
        setTimeout(() => {
            this.gridVisible.set(true);
        });
    }

    recreateWithNoState(): void {
        this.recreateGrid();
    }

    recreateWithColumnOrder(): void {
        this.recreateGrid(columnOrderState);
    }

    recreateWithPartialColumnOrder(): void {
        this.recreateGrid({ ...columnOrderState, partialColumnState: true });
    }

    onGridReady(params: GridReadyEvent<IOlympicData>): void {
        this.gridApi = params.api;
        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}
