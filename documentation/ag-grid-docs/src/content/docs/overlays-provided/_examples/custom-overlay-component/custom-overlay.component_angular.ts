import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IOverlayAngularComp } from 'ag-grid-angular';
import type { IOverlayParams } from 'ag-grid-community';

type CustomOverlayParams = IOverlayParams & { loadingMessage: string; noRowsMessage: string };

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="overlay-center" role="presentation">
            @if (params()?.overlayType === 'loading') {
                <div
                    role="presentation"
                    style="width: 100px; height: 100px; background: url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto;"
                ></div>
            }
            <div aria-live="polite" aria-atomic="true">{{ message() }}</div>
        </div>
    `,
})
export class CustomOverlay implements IOverlayAngularComp {
    params = signal<CustomOverlayParams | null>(null);
    message = signal('');

    agInit(params: CustomOverlayParams): void {
        this.refresh(params);
    }

    refresh(params: CustomOverlayParams): void {
        this.params.set(params);

        let message = '';
        if (params.overlayType === 'loading') {
            message = params.loadingMessage;
        } else if (params.overlayType === 'noRows') {
            message = params.noRowsMessage;
        }

        this.message.set(message);
    }
}
