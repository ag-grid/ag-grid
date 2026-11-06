import { ChangeDetectorRef, Component, inject } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';

import './styles.css';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);
type ScrollGestureMode = NonNullable<GridOptions['scrollGestureMode']>;

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular],
    template: `
        <div class="example-wrapper">
            <div class="example-controls">
                <div class="controls-row">
                    <label for="scrollGestureMode">Scroll gesture mode:</label>
                    <select
                        id="scrollGestureMode"
                        [value]="scrollGestureMode"
                        (change)="onScrollGestureModeChange($event)"
                    >
                        <option value="native">native</option>
                        <option value="axisLocked">axisLocked</option>
                    </select>
                </div>
            </div>
            <div id="myGrid">
                @if (gridVisible) {
                    <ag-grid-angular
                        style="width: 100%; height: 100%;"
                        [scrollGestureMode]="scrollGestureMode"
                        [columnDefs]="columnDefs"
                        [defaultColDef]="defaultColDef"
                        [rowData]="rowData"
                    />
                }
            </div>
        </div>
    `,
})
export class AppComponent {
    private readonly changeDetector = inject(ChangeDetectorRef);
    public scrollGestureMode: ScrollGestureMode = 'native';
    public gridVisible = true;
    public columnDefs: ColDef[] = Array.from({ length: 10 }, (_, i) => ({
        field: `c${i}`,
        headerName: `Column ${i + 1}`,
    }));
    public defaultColDef: ColDef = { width: 180 };
    public rowData = Array.from({ length: 100 }, (_, row) =>
        Object.fromEntries(Array.from({ length: 10 }, (_, col) => [`c${col}`, `Row ${row + 1}, column ${col + 1}`]))
    );

    public onScrollGestureModeChange(event: Event): void {
        // Recreate the grid when this initial-only option changes.
        this.gridVisible = false;
        this.changeDetector.detectChanges();
        this.scrollGestureMode = (event.target as HTMLSelectElement).value as ScrollGestureMode;
        this.gridVisible = true;
    }
}
