import type { ElementRef } from '@angular/core';
import { Component, ViewChild } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `<div #wrapper style="overflow: hidden; text-overflow: ellipsis">{{ this.displayValue }}</div>`,
})
export class AthleteCellRenderer implements ICellRendererAngularComp {
    public displayValue!: string;

    @ViewChild('wrapper', { static: true }) private wrapper!: ElementRef;

    agInit(params: ICellRendererParams<IOlympicData, string>): void {
        this.displayValue = params.value!;
        const el = this.wrapper.nativeElement;

        params.setTooltip(`Dynamic Tooltip for ${params.value}`, () => el.scrollWidth > el.clientWidth);
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
