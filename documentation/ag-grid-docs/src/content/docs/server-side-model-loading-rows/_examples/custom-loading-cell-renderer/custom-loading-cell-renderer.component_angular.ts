import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ILoadingCellRendererAngularComp } from 'ag-grid-angular';
import type { ILoadingCellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-custom-loading-cell" style="padding-left: 10px; line-height: 25px;">
            <i class="fas fa-spinner fa-pulse"></i>
            <span> {{ loadingMessage() }} </span>
        </div>
    `,
})
export class CustomLoadingCellRenderer implements ILoadingCellRendererAngularComp {
    loadingMessage = signal('');

    agInit(params: ILoadingCellRendererParams & { loadingMessage: string }): void {
        this.loadingMessage.set(params.loadingMessage);
    }
}
