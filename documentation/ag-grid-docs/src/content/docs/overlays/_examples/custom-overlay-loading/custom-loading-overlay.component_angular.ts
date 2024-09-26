import { Component } from '@angular/core';

import type { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import type { ILoadingOverlayParams } from 'ag-grid-community';

type CustomLoadingOverlayParams = ILoadingOverlayParams & { loadingMessage: string };
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
    public params!: CustomLoadingOverlayParams;

    agInit(params: CustomLoadingOverlayParams): void {
        this.refresh(params);
    }

    refresh(params: CustomLoadingOverlayParams): void {
        this.params = params;
    }
}
