import { Component, signal } from '@angular/core';

import { AgGridAngular } from 'ag-grid-angular';
import { ClientSideRowModelModule, ModuleRegistry, enableDevValidations } from 'ag-grid-community';
import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';

import { CustomOverlayComponent } from './custom-overlay.component';
import './styles.css';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
            <button (click)="incParam()">Increment Param</button>
        </div>
        <ag-grid-angular
            style="width: 100%; height: 100%;"
            class="grid-wrapper"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
            [activeOverlay]="activeOverlay()"
            [activeOverlayParams]="activeOverlayParams()"
        />
    </div>`,
})
export class AppComponent {
    columnDefs: ColDef[] = [
        { field: 'athlete', flex: 1 },
        { field: 'country', flex: 1 },
    ];
    rowData: IAthlete[] | null = [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Natalie Coughlin', country: 'United States' },
        { athlete: 'Aleksey Nemov', country: 'Russia' },
        { athlete: 'Alicia Coutts', country: 'Australia' },
    ];

    activeOverlay = signal<any>(CustomOverlayComponent);
    activeOverlayParams = signal({ count: 1 });

    showActiveOverlay() {
        this.activeOverlay.set(CustomOverlayComponent);
    }

    clearActiveOverlay() {
        this.activeOverlay.set(undefined);
    }
    incParam() {
        this.activeOverlayParams.update((prev) => ({ count: prev.count + 1 }));
    }
}
