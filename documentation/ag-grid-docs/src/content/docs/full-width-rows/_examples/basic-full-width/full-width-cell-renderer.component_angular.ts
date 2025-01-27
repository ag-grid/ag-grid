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
        this.cssClass.set(params.node.rowPinned ? 'example-full-width-pinned-row' : 'example-full-width-row');
        this.message.set(
            params.node.rowPinned
                ? `Pinned full width row at index ${params.node.rowIndex}`
                : `Normal full width row at index ${params.node.rowIndex}`
        );
    }

    clicked() {
        alert('button clicked');
    }

    refresh() {
        return false;
    }
}
