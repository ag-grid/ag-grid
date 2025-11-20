import { Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import {
    ClientSideRowModelModule,
    ColDef,
    ColGroupDef,
    GridApi,
    GridOptions,
    GridReadyEvent,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';

import { CustomOverlayComponent } from './custom-overlay.component';
import './styles.css';

ModuleRegistry.registerModules([
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `<div class="example-wrapper">
        <div class="button-row">
            <button (click)="showActiveOverlay()">Show custom overlay</button>
            <button (click)="clearActiveOverlay()">Hide custom overlay</button>
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            class="grid-wrapper"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
            [defaultColDef]="defaultColDef"
            (gridReady)="onGridReady($event)"
        />
    </div>`,
})
export class AppComponent {
    private gridApi!: GridApi<IAthlete>;

    columnDefs: ColDef[] = [
        { field: 'athlete', width: 150 },
        { field: 'country', width: 150 },
    ];
    rowData: IAthlete[] | null = [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Natalie Coughlin', country: 'United States' },
        { athlete: 'Aleksey Nemov', country: 'Russia' },
        { athlete: 'Alicia Coutts', country: 'Australia' },
    ];
    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 120,
    };

    showActiveOverlay() {
        this.gridApi.setGridOption('activeOverlay', CustomOverlayComponent);
    }

    clearActiveOverlay() {
        this.gridApi.setGridOption('activeOverlay', undefined);
    }

    onGridReady(params: GridReadyEvent<IAthlete>) {
        this.gridApi = params.api;
    }
}
