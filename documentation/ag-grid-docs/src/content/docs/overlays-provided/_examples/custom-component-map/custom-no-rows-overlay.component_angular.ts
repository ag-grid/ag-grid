import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { INoRowsOverlayAngularComp } from 'ag-grid-angular';
import type { INoRowsOverlayParams } from 'ag-grid-community';

type CustomNoRowsOverlayParams = INoRowsOverlayParams & {
    noRows: { overlayText: string };
};

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <div class="overlay-loading-center" style="background-color: #b4bebe;">
        <span class="far fa-frown" aria-hidden="true"></span> <span role="status">{{ noRowsText() }}</span>
    </div>`,
})
export class CustomNoRowsOverlay implements INoRowsOverlayAngularComp {
    noRowsText = signal('');

    agInit(params: CustomNoRowsOverlayParams): void {
        this.refresh(params);
    }

    refresh(params: CustomNoRowsOverlayParams): void {
        this.noRowsText.set(params.noRows.overlayText);
    }
}
