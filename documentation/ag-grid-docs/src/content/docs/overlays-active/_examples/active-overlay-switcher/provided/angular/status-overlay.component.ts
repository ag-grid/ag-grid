import { Component } from '@angular/core';

import type { IOverlayAngularComp } from 'ag-grid-angular';
import type { IOverlayParams } from 'ag-grid-community';

export interface StatusOverlayParams {
    myCounter?: number;
}

@Component({
    selector: 'app-status-overlay',
    standalone: true,
    template: `<div class="status-overlay">custom: {{ myCounter }}</div>`,
})
export class StatusOverlayComponent implements IOverlayAngularComp {
    public myCounter?: number;

    agInit(params: IOverlayParams & StatusOverlayParams): void {
        this.updateCounter(params);
    }

    refresh(params: IOverlayParams & StatusOverlayParams): void {
        this.updateCounter(params);
    }

    private updateCounter(params: StatusOverlayParams): void {
        this.myCounter = params.myCounter;
    }
}
