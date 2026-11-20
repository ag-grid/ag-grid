import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div>{{ displayValue() }}</div>`,
})
export class AthleteCellRenderer implements ICellRendererAngularComp {
    displayValue = signal('');

    agInit(params: ICellRendererParams<IOlympicData, string>): void {
        this.displayValue.set(params.value!);
        params.setTooltip('Won more than one gold medal at these Games', () => params.data!.gold > 1);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
