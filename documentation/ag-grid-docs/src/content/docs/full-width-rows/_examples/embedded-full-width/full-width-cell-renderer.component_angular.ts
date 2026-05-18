import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (!hidden()) {
            <div [class]="cssClass()">
                <button (click)="clicked()">Click</button>
                {{ message() }}
            </div>
        }
    `,
})
export class FullWidthCellRenderer implements ICellRendererAngularComp {
    hidden = signal(false);
    cssClass = signal('');
    message = signal('');

    agInit(params: ICellRendererParams): void {
        const {
            pinned,
            node: { rowIndex },
        } = params;

        if ((pinned === 'left' && rowIndex! % 4 === 0) || (pinned === 'right' && rowIndex! % 2 === 0)) {
            this.hidden.set(true);
            return;
        }

        this.cssClass.set(pinned ? 'example-full-width-pinned' : 'example-full-width-row');
        this.message.set(
            pinned
                ? `Pinned full width on ${pinned} - index ${rowIndex}`
                : `Non pinned full width row at index ${rowIndex}`
        );
    }

    clicked() {
        console.log('button clicked');
    }

    refresh() {
        return false;
    }
}
