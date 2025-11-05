import { Component } from '@angular/core';

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
    imports: [AgGridAngular, StatusOverlayComponent],
    template: `<div class="example-wrapper">
        <div class="button-row">
            <button type="button" (click)="showLoadingOverlay()">Show loading overlay</button>
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
                [activeOverlay]="overlayState.activeOverlay"
                [activeOverlayParams]="overlayState.activeOverlayParams"
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

    public overlayState: OverlayState = {
        activeOverlay: undefined,
        activeOverlayParams: undefined,
    };

    private statusOverlayCounter = 0;

    public showLoadingOverlay(): void {
        this.overlayState = {
            activeOverlay: 'agLoadingOverlay',
            activeOverlayParams: undefined,
        };
    }

    public showNoRowsOverlay(): void {
        this.overlayState = {
            activeOverlay: 'agNoRowsOverlay',
            activeOverlayParams: undefined,
        };
    }

    public showCustomOverlay(): void {
        this.statusOverlayCounter += 1;
        this.overlayState = {
            activeOverlay: 'statusOverlay',
            activeOverlayParams: { myCounter: this.statusOverlayCounter },
        };
    }

    public clearOverlay(): void {
        this.overlayState = {
            activeOverlay: undefined,
            activeOverlayParams: undefined,
        };
    }
}
