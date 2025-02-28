import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ` <div [class]="cssClass">
        <button (click)="clicked()">Click</button>
        {{ message }}
    </div>`,
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    cssClass = signal('');
    message = signal('');

    agInit(params: ICellRendererParams): void {
        this.cssClass.set(params.pinned ? 'example-full-width-pinned' : 'example-full-width-row');
        this.message.set(
            params.pinned
                ? `Pinned full width on ${params.pinned} - index ${params.node.rowIndex}`
                : `Non pinned full width row at index ${params.node.rowIndex}`
        );
    }

    clicked() {
        alert('button clicked');
    }

    refresh() {
        return false;
    }
}
