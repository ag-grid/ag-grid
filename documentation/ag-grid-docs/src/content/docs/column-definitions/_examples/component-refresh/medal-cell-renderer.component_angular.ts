import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<span>{{ displayValue() }}</span>`,
})
export class MedalCellRenderer implements ICellRendererAngularComp {
    displayValue = signal<string>('');

    agInit(params: ICellRendererParams): void {
        console.log('renderer created');
        this.updateDisplayValue(params);
    }

    refresh(params: ICellRendererParams): boolean {
        console.log('renderer refreshed');
        this.updateDisplayValue(params);
        return true;
    }

    private updateDisplayValue(params: ICellRendererParams): void {
        const medalSymbolsForCount = new Array(params.value!).fill('#').join('');
        this.displayValue.set(medalSymbolsForCount);
    }
}
