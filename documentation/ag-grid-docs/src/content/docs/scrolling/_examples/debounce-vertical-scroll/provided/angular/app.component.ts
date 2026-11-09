import { ChangeDetectorRef, Component } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <label>
                    <input type="checkbox" [checked]="debounceVerticalScrollbar" (change)="onDebounceChange($event)" />
                    Debounce vertical scroll
                </label>
            </div>
            @if (gridVisible) {
                <ag-grid-angular
                    id="myGrid"
                    [columnDefs]="columnDefs"
                    [defaultColDef]="defaultColDef"
                    [rowData]="rowData"
                    [rowHeight]="40"
                    [debounceVerticalScrollbar]="debounceVerticalScrollbar"
                />
            }
        </div>
    `,
})
export class AppComponent {
    public columnDefs: ColDef[] = [{ field: 'row' }, { field: 'name' }];
    public defaultColDef: ColDef = { flex: 1 };
    public rowData = Array.from({ length: 1000 }, (_, index) => ({ row: index + 1, name: `Item ${index + 1}` }));
    public debounceVerticalScrollbar = false;
    public gridVisible = true;

    constructor(private readonly changeDetector: ChangeDetectorRef) {}

    onDebounceChange(event: Event): void {
        // This initial-only option requires a new grid when toggled.
        this.gridVisible = false;
        this.changeDetector.detectChanges();
        this.debounceVerticalScrollbar = (event.target as HTMLInputElement).checked;
        this.gridVisible = true;
    }
}
