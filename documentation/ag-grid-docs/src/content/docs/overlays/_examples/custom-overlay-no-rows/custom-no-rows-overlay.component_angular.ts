import type { INoRowsOverlayAngularComp } from '@ag-grid-community/angular';
import type { INoRowsOverlayParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    template: ` <div class="ag-overlay-loading-center" style="background-color: #b4bebe;" role="presentation">
        <i class="far fa-frown" aria-live="polite" aria-atomic="true"> {{ params.noRowsMessageFunc() }} </i>
    </div>`,
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
    public params!: INoRowsOverlayParams & { noRowsMessageFunc: () => string };

    agInit(params: INoRowsOverlayParams & { noRowsMessageFunc: () => string }): void {
        this.params = params;
    }
}
