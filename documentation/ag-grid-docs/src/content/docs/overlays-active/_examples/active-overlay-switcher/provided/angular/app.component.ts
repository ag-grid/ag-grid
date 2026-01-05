import { Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AgGridAngular } from 'ag-grid-angular';
import type { IOverlayAngularComp } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import type { IOverlayParams } from 'ag-grid-community';

import './styles.css';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

@Component({
    standalone: true,
    template: `<div class="status-overlay">Custom</div>`,
})
export class StatusOverlayComponent implements IOverlayAngularComp {
    agInit(params: IOverlayParams): void {
        console.log('init');
    }
}

interface Athlete {
    athlete: string;
    country: string;
}

@Component({
    selector: 'my-app',
    standalone: true,
    imports: [AgGridAngular, FormsModule],
    template: `<div class="example-wrapper">
        <div class="button-row">
            <label class="toggle loading-toggle"
                ><input type="checkbox" [checked]="loadingToggle()" (change)="loadingToggle.set(!loadingToggle())" />
                Loading</label
            >
            <button type="button" (click)="showNoRowsOverlay()">activeOverlay = agNoRowsOverlay</button>
            <button type="button" (click)="showCustomOverlay()">activeOverlay = CustomOverlay</button>
            <button type="button" (click)="clearOverlay()">Hide activeOverlay</button>
        </div>
        <div class="grid-wrapper">
            <ag-grid-angular
                style="width: 100%; height: 100%;"
                [columnDefs]="columnDefs"
                [rowData]="rowData"
                [components]="components"
                [loading]="loading()"
                [activeOverlay]="activeOverlay()"
            />
        </div>
    </div>`,
})
export class AppComponent {
    public readonly columnDefs: ColDef<Athlete>[] = [
        { field: 'athlete', flex: 1 },
        { field: 'country', flex: 1 },
    ];

    public readonly rowData: Athlete[] = [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Natalie Coughlin', country: 'United States' },
    ];

    public readonly components = { statusOverlay: StatusOverlayComponent };

    public readonly activeOverlay = signal<string | undefined>(undefined);
    public readonly loadingToggle = signal<boolean>(false);
    public readonly loading = computed(() => this.loadingToggle());

    public showNoRowsOverlay(): void {
        this.activeOverlay.set('agNoRowsOverlay');
    }

    public showCustomOverlay(): void {
        this.activeOverlay.set('statusOverlay');
    }

    public clearOverlay(): void {
        this.activeOverlay.set(undefined);
    }
}
