import { Component, signal } from '@angular/core';

import type { IOverlayAngularComp } from 'ag-grid-angular';
import type { IOverlayParams } from 'ag-grid-community';

export interface CustomParams {
    count: number;
}

@Component({
    selector: 'app-custom-overlay',
    standalone: true,
    template: `<div class="my-custom-overlay">Custom Overlay: {{ count() }}</div>`,
})
export class CustomOverlayComponent implements IOverlayAngularComp {
    count = signal(0);

    agInit(params: IOverlayParams & CustomParams): void {
        this.refresh(params);
    }

    refresh(params: IOverlayParams & CustomParams) {
        this.count.set(params.count);
    }
}
