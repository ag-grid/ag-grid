import { Component, ViewChild, ElementRef } from "@angular/core";

import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core"

@Component({
    standalone: true,
    template: `<div #wrapper style="overflow: hidden; text-overflow: ellipsis">{{this.displayValue}}</div>`
})
export class AthleteCellRenderer implements ICellRendererAngularComp {
    public displayValue!: string;

    @ViewChild('wrapper', { static: true }) private wrapper!: ElementRef;

    agInit(params: ICellRendererParams<IOlympicData, string>): void {
        this.displayValue = params.value!
        const el = this.wrapper.nativeElement;

        params.setTooltip(`Dynamic Tooltip for ${params.value}`, () => el.scrollWidth > el.clientWidth)
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
