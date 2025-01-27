import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <button (click)="onClick()">Update Data</button>
        </div>
    `,
})
export class UpdateCellRenderer implements ICellRendererAngularComp {
    params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(): boolean {
        return false;
    }

    onClick(): void {
        const { node } = this.params;
        const { gold, silver, bronze } = node.data;
        node.updateData({
            ...node.data,
            gold: gold + 1,
            silver: silver + 1,
            bronze: bronze + 1,
        });
    }
}
