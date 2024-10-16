import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridReadyEvent, RowSelectionOptions } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
// NOTE: Angular CLI does not support component CSS imports: angular-cli/issues/23273
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { Component } from '@angular/core';

import { getData } from './data';
import './styles.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
    standalone: true,
    imports: [AgGridAngular],
    selector: 'my-app',
    template: `
        <div class="test-container">
            <div class="test-header">
                <div style="margin-bottom: 1rem;">
                    <input type="checkbox" id="pinFirstColumnOnLoad" />
                    <label for="pinFirstColumnOnLoad">Pin first column on load</label>
                </div>
                <div style="margin-bottom: 1rem;">
                    <button id="reloadGridButton" (click)="reloadGrid()">Reload Grid</button>
                </div>
            </div>
            @if (isVisible) {
                <ag-grid-angular
                    style="width: 100%; height: 100%;"
                    [class]="themeClass"
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                />
            }
        </div>
    `,
})
export class AppComponent {
    themeClass =
        /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
        'ag-theme-quartz' /** DARK MODE END **/;
    public isVisible = true;
    private gridApi!: GridApi;
    public columnDefs: ColDef[] = [
        { field: 'name', headerName: 'Athlete', width: 250 },
        { field: 'person.country', headerName: 'Country' },
        { field: 'person.age', headerName: 'Age' },
        { field: 'medals.gold', headerName: 'Gold Medals' },
        { field: 'medals.silver', headerName: 'Silver Medals' },
        { field: 'medals.bronze', headerName: 'Bronze Medals' },
    ];

    public rowData: any[] | null = getData();

    reloadGrid() {
        this.isVisible = false;
        setTimeout(() => (this.isVisible = true), 1);
    }

    onGridReady(params: GridReadyEvent) {
        this.gridApi = params.api;
        const checkbox = document.querySelector<HTMLInputElement>('#pinFirstColumnOnLoad')!;
        const shouldPinFirstColumn = checkbox && checkbox.checked;
        if (shouldPinFirstColumn) {
            params.api.applyColumnState({
                state: [{ colId: 'name', pinned: 'left' }],
            });
        }
    }
}
