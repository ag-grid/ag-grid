import type { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, ViewChild, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div #wrapper style="overflow: hidden; text-overflow: ellipsis">{{ displayValue() }}</div>`,
})
export class AthleteCellRenderer implements ICellRendererAngularComp {
    displayValue = signal('');

    @ViewChild('wrapper', { static: true }) private wrapper!: ElementRef;

    agInit(params: ICellRendererParams<IOlympicData, string>): void {
        this.displayValue.set(params.value!);
        const el = this.wrapper.nativeElement;

        params.setTooltip(`Dynamic Tooltip for ${params.value}`, () => el.scrollWidth > el.clientWidth);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
