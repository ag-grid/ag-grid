import { Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';

import type { StatusOverlayParams } from './status-overlay.component';
import { StatusOverlayComponent } from './status-overlay.component';
import './styles.css';

ModuleRegistry.registerModules([
    TextEditorModule,
    TextFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface Athlete {
    athlete: string;
    country: string;
}

interface OverlayState {
    activeOverlay: 'agLoadingOverlay' | 'agNoRowsOverlay' | 'statusOverlay' | undefined;
    activeOverlayParams: StatusOverlayParams | undefined;
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, FormsModule, StatusOverlayComponent],
    template: `<div class="example-wrapper">
        <div class="button-row">
            <label class="toggle loading-toggle"><input type="checkbox" [(ngModel)]="loadingToggle" /> Loading</label>
            <button type="button" (click)="showNoRowsOverlay()">Show no-rows overlay</button>
            <button type="button" (click)="showCustomOverlay()">Show custom overlay</button>
            <button type="button" (click)="clearOverlay()">Hide overlay</button>
        </div>
        <div class="grid-wrapper">
            <ag-grid-angular
                style="width: 100%; height: 100%;"
                class="ag-theme-quartz"
                [columnDefs]="columnDefs"
                [defaultColDef]="defaultColDef"
                [rowData]="rowData"
                [components]="components"
                [loading]="loading()"
                [activeOverlay]="overlayState().activeOverlay"
                [activeOverlayParams]="overlayState().activeOverlayParams"
            />
        </div>
    </div>`,
})
export class AppComponent {
    public readonly columnDefs: ColDef<Athlete>[] = [
        { field: 'athlete', width: 150 },
        { field: 'country', width: 150 },
    ];

    public readonly defaultColDef: ColDef = {
        flex: 1,
        minWidth: 120,
    };

    public readonly rowData: Athlete[] = [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Natalie Coughlin', country: 'United States' },
    ];

    public readonly components = { statusOverlay: StatusOverlayComponent };

    public readonly overlayState = signal<OverlayState>({
        activeOverlay: undefined,
        activeOverlayParams: undefined,
    });

    public readonly loadingToggle = model<boolean>(false);
    public readonly loading = computed<boolean | undefined>(() => (this.loadingToggle() ? true : undefined));

    private statusOverlayCounter = 0;

    public showNoRowsOverlay(): void {
        this.overlayState.set({
            activeOverlay: 'agNoRowsOverlay',
            activeOverlayParams: undefined,
        });
    }

    public showCustomOverlay(): void {
        this.statusOverlayCounter += 1;
        this.overlayState.set({
            activeOverlay: 'statusOverlay',
            activeOverlayParams: { myCounter: this.statusOverlayCounter },
        });
    }

    public clearOverlay(): void {
        this.overlayState.set({
            activeOverlay: undefined,
            activeOverlayParams: undefined,
        });
    }
}
