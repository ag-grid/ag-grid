import { Component, ViewChild } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    enableDevValidations,
} from 'ag-grid-community';

import './styles.css';

// Opt into dev-only validation diagnostics, surfaced in an overlay over each grid.
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ClientSideRowModelApiModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div class="grid-section">
                <div class="controls">
                    <span class="grid-label">Grid A</span>
                    <button type="button" (click)="triggerWarning('a')">Trigger warning</button>
                    <button type="button" (click)="triggerError('a')">Trigger error</button>
                    <button type="button" (click)="triggerAsyncWarning('a')">Trigger async warning</button>
                    <button type="button" (click)="destroyThenCallApi('a')">Destroy grid, then call API</button>
                </div>
                <ag-grid-angular
                    class="grid"
                    #gridA
                    [rowData]="rowData"
                    [columnDefs]="columnDefs"
                    [getRowId]="getRowId"
                />
            </div>

            <div class="grid-section">
                <div class="controls">
                    <span class="grid-label">Grid B</span>
                    <button type="button" (click)="triggerWarning('b')">Trigger warning</button>
                    <button type="button" (click)="triggerError('b')">Trigger error</button>
                    <button type="button" (click)="triggerAsyncWarning('b')">Trigger async warning</button>
                </div>
                <ag-grid-angular
                    class="grid"
                    #gridB
                    [rowData]="rowData"
                    [columnDefs]="columnDefs"
                    [getRowId]="getRowId"
                />
            </div>
        </div>
    `,
})
export class AppComponent {
    columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];
    rowData: any[] = [
        { id: 'tesla', make: 'Tesla', model: 'Model Y', price: 64950 },
        { id: 'ford', make: 'Ford', model: 'F-Series', price: 33850 },
        { id: 'toyota', make: 'Toyota', model: 'Corolla', price: 29600 },
    ];
    getRowId = (params: { data: { id: string } }) => params.data.id;

    @ViewChild('gridA') gridA!: AgGridAngular;
    @ViewChild('gridB') gridB!: AgGridAngular;

    apiFor(grid: string) {
        return (grid === 'a' ? this.gridA : this.gridB).api;
    }

    // Updating an initial-only option after creation emits warning #22 on the targeted grid.
    triggerWarning(grid: string) {
        this.apiFor(grid).setGridOption('tooltipInteraction', true);
    }

    // `getServerSideGroupLevelState` needs the unregistered enterprise server-side module, so calling it
    // on a client-side grid emits error #200, attributed to that grid, and no-ops without affecting layout.
    triggerError(grid: string) {
        this.apiFor(grid).getServerSideGroupLevelState();
    }

    // An async transaction is flushed by the grid on a later frame, so the non-string row-id warning
    // (#25) it produces is emitted from the grid's own async work rather than a synchronous call. It
    // self-attributes through the grid's log bean, so it stays on the grid that ran the transaction.
    triggerAsyncWarning(grid: string) {
        this.apiFor(grid).applyTransactionAsync({ add: [{ id: 4, make: 'Rivian', model: 'R1T', price: 73000 }] });
    }

    // Calling the API of a destroyed grid emits warning #26. There is no grid left to own the
    // diagnostic, so it can't be attributed and instead surfaces on the other, still-live grid.
    destroyThenCallApi(grid: string) {
        const api = this.apiFor(grid);
        api.destroy();
        api.exportDataAsExcel();
    }
}
