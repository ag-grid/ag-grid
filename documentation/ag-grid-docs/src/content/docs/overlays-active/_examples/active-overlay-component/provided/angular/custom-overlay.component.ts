import { Component, signal } from '@angular/core';

import type { IOverlayAngularComp } from 'ag-grid-angular';
import type { IOverlayParams } from 'ag-grid-community';

export interface CustomParams {
    count: number;
}

@Component({
    selector: 'app-custom-overlay',
    standalone: true,
    template: `<div class="my-custom-overlay">
        <span>Custom Overlay: {{ count() }}</span>
        <span class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            Custom overlay shown. Count {{ count() }}.
        </span>
    </div>`,
})
export class CustomOverlayComponent implements IOverlayAngularComp {
    public count = signal(0);

    public agInit(params: IOverlayParams & CustomParams): void {
        this.refresh(params);
    }

    public refresh(params: IOverlayParams & CustomParams): void {
        this.count.set(params.count);
    }
}
