import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span>
        <button style="height: 30px;" (click)="onClick()">✎</button>
        <span style="padding-left: 4px;">{{ displayValue() }}</span>
    </span>`,
})
export class CellRenderer implements ICellRendererAngularComp {
    displayValue = signal<string>('');

    private params!: ICellRendererParams<IOlympicData, string>;
    agInit(params: ICellRendererParams<IOlympicData, string>): void {
        this.params = params;
        this.displayValue.set(params.value ?? '');
    }

    onClick() {
        this.params.api.startEditingCell({
            rowIndex: this.params.node.rowIndex!,
            colKey: this.params.column!.getId(),
        });
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
