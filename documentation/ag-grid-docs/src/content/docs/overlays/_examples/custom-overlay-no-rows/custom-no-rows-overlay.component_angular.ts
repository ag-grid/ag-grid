import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { INoRowsOverlayAngularComp } from 'ag-grid-angular';
import type { INoRowsOverlayParams } from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & { noRowsMessageFunc: () => string };

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <div class="ag-overlay-loading-center" style="background-color: #b4bebe;" role="presentation">
        <i class="far fa-frown" aria-live="polite" aria-atomic="true"> {{ noRowsMessage() }} </i>
    </div>`,
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
    noRowsMessage = signal('');

    agInit(params: CustomNoRowsOverlayParams): void {
        this.refresh(params);
    }

    refresh(params: CustomNoRowsOverlayParams): void {
        this.noRowsMessage.set(params.noRowsMessageFunc());
    }
}
