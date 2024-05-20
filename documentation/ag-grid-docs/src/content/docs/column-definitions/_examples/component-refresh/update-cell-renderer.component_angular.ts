import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
    standalone: true,
    template: `
        <div>
            <button (click)="onClick()">Update Data</button>
        </div>
    `,
})
export class UpdateCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;

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
