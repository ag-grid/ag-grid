import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type {
    AutoGroupColumnDef,
    ColDef,
    ColGroupDef,
    GridApi,
    GridOptions,
    GridPreDestroyedEvent,
    GridReadyEvent,
    GridState,
    RowSelectionOptions,
    StateUpdatedEvent,
    Toolbar,
} from 'ag-grid-community';
import { ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import type { IOlympicData } from './interfaces';
import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="example-wrapper">
            <div>
                <span class="button-group">
                    <button (click)="saveState()">Save State</button>
                    <button (click)="reloadGrid()">Recreate Grid with No State</button>
                    <button (click)="setState()">Set State</button>
                    <button (click)="printState()">Print State</button>
                </span>
            </div>
            @if (gridVisible()) {
                <ag-grid-angular
                    style="width: 100%; height: 100%;"
                    gridId="setState"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [defaultColGroupDef]="defaultColGroupDef"
                    [autoGroupColumnDef]="autoGroupColumnDef"
                    [sideBar]="true"
                    [toolbar]="toolbar"
                    [pagination]="true"
                    [rowSelection]="rowSelection"
                    [cellSelection]="true"
                    [calculatedColumns]="true"
                    [enableRowPinning]="true"
                    [suppressColumnMoveAnimation]="true"
                    [rowData]="rowData"
                    [gridOptions]="gridOptions"
                    (stateUpdated)="onStateUpdated($event)"
                    (gridReady)="onGridReady($event)"
                />
            }
        </div>
    `,
})
export class AppComponent {
    private gridApi!: GridApi<IOlympicData>;

    public columnDefs: (ColDef | ColGroupDef)[] = [
        { field: 'athlete', minWidth: 150 },
        { field: 'age' },
        { field: 'country', minWidth: 150 },
        {
            headerName: 'Competition',
            groupId: 'competition',
            children: [{ field: 'year' }, { field: 'date', minWidth: 150 }, { field: 'sport', minWidth: 150 }],
        },
        {
            headerName: 'Medals',
            groupId: 'medals',
            children: [
                { field: 'gold' },
                { field: 'silver', columnGroupShow: 'open' },
                { field: 'bronze', columnGroupShow: 'open' },
                { field: 'total', columnGroupShow: 'closed' },
            ],
        },
    ];
    public defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        headerNameEditable: true,
    };
    public defaultColGroupDef: Partial<ColGroupDef> = { headerNameEditable: true };
    public autoGroupColumnDef: AutoGroupColumnDef = { minWidth: 200 };
    public rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
    };
    public toolbar: Toolbar = { items: ['agQuickFilterToolbarItem'] };
    public rowData?: IOlympicData[];
    public gridVisible = signal(true);
    public gridOptions: GridOptions = {
        onGridPreDestroyed: (params: GridPreDestroyedEvent<IOlympicData>) => {
            console.log('Grid state on destroy (can be persisted)', params.state);
        },
    };

    private savedState?: GridState;

    constructor(private http: HttpClient) {}

    reloadGrid(): void {
        this.gridVisible.set(false);
        this.rowData = undefined;
        setTimeout(() => {
            this.gridVisible.set(true);
        });
    }

    printState(): void {
        console.log('Grid state', this.gridApi.getState());
    }

    saveState(): void {
        this.savedState = this.gridApi.getState();
        console.log('Saved state', this.savedState);
    }

    setState(): void {
        if (this.savedState) {
            this.gridApi.setState(this.savedState);
            console.log('Set state', this.savedState);
        }
    }

    onStateUpdated(params: StateUpdatedEvent<IOlympicData>): void {
        console.log('State updated', params.state);
    }

    onGridReady(params: GridReadyEvent<IOlympicData>): void {
        this.gridApi = params.api;
        this.http
            .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .subscribe((data) => (this.rowData = data));
    }
}
