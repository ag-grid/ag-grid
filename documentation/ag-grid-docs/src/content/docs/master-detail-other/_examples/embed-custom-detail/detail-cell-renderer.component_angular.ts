import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<h1 class="custom-detail" style="padding: 20px;">{{ pinned() }}</h1>`,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    pinned = signal<string>('');

    agInit(params: ICellRendererParams): void {
        this.pinned.set(params.pinned ?? 'center');
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
