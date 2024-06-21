import type { INoRowsOverlayAngularComp } from '@ag-grid-community/angular';
import type { INoRowsOverlayParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & { noRowsMessageFunc: () => string };

@Component({
    standalone: true,
    template: ` <div class="ag-overlay-loading-center" style="background-color: #b4bebe;" role="presentation">
        <i class="far fa-frown" aria-live="polite" aria-atomic="true"> {{ params.noRowsMessageFunc() }} </i>
    </div>`,
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
    public params!: CustomNoRowsOverlayParams;

    agInit(params: CustomNoRowsOverlayParams): void {
        this.refresh(params);
    }

    refresh(params: CustomNoRowsOverlayParams): void {
        this.params = params;
    }
}
