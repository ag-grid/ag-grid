import type { ILoadingOverlayAngularComp } from '@ag-grid-community/angular';
import type { ILoadingOverlayParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    template: `
        <div class="ag-overlay-loading-center" role="presentation">
            <div
                role="presentation"
                style="width: 100px; height: 100px; background: url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto;"
            ></div>
            <div aria-live="polite" aria-atomic="true">{{ params.loadingMessage }}</div>
        </div>
    `,
})
export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
    public params!: ILoadingOverlayParams & { loadingMessage: string };

    agInit(params: ILoadingOverlayParams & { loadingMessage: string }): void {
        this.params = params;
    }
}
