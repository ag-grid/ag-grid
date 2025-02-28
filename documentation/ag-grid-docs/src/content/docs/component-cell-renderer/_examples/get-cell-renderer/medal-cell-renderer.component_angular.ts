import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span>{{ displayValue() }}</span>`,
})
export class MedalCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams<IOlympicData, number>;
    displayValue = signal('');

    agInit(params: ICellRendererParams<IOlympicData, number>): void {
        this.params = params;
        this.displayValue.set(Array(params.value!).fill('#').join(''));
    }

    medalUserFunction() {
        console.log(
            `user function called for medal column: row = ${this.params.node.rowIndex}, column = ${this.params.column!.getId()}`
        );
    }
    refresh(params: ICellRendererParams) {
        return false;
    }
}
