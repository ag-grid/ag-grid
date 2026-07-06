import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import type { ILoadingOverlayParams } from 'ag-grid-community';

type CustomLoadingOverlayParams = ILoadingOverlayParams & {
    loading: { overlayText: string };
};
@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="overlay-loading-center">
            <div
                aria-hidden="true"
                style="width: 100px; height: 100px; background: url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto;"
            ></div>
            <div>{{ loadingText() }}</div>
        </div>
    `,
})
export class CustomLoadingOverlay implements ILoadingOverlayAngularComp {
    loadingText = signal('');

    agInit(params: CustomLoadingOverlayParams): void {
        this.refresh(params);
    }

    refresh(params: CustomLoadingOverlayParams): void {
        this.loadingText.set(params.loading.overlayText);
    }
}
