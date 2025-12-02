import { Component } from '@angular/core';

import type { IOverlayAngularComp } from 'ag-grid-angular';

export interface StatusOverlayParams {
    myCounter?: number;
}

@Component({
    selector: 'app-custom-overlay',
    standalone: true,
    template: `<div class="my-custom-overlay">Custom overlay</div>`,
})
export class CustomOverlayComponent implements IOverlayAngularComp {
    agInit(): void {}
}
