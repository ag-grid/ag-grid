import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ILoadingCellRendererAngularComp } from 'ag-grid-angular';
import type { ILoadingCellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
            @if (failedLoad()) {
                <i class="fas fa-times"></i>
                <span> Data failed to load </span>
            } @else {
                <i class="fas fa-spinner fa-pulse"></i>
                <span> {{ loadingMessage() }} </span>
            }
        </div>
    `,
})
export class CustomLoadingCellRenderer implements ILoadingCellRendererAngularComp {
    failedLoad = signal<boolean | undefined>(false);
    loadingMessage = signal('');

    agInit(params: ILoadingCellRendererParams & { loadingMessage: string }): void {
        this.failedLoad.set(params.node.failedLoad);
        this.loadingMessage.set(params.loadingMessage);
    }
}
