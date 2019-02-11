import { Component } from '@angular/core';
import { ITooltipAngularComp } from "ag-grid-angular";

@Component({
    selector: 'tooltip-component',
    template: `<div class="custom-tooltip" [style.background-color]="this.data.color">` +
            `<p><span>{{this.data.athlete}}</span></p>` +
            `<p><span>Country: </span>{{this.data.country}}</p>` +
            `<p><span>Total: </span>{{this.data.total}}</p>` +
        `</div>`
})
export class CustomTooltip implements ITooltipAngularComp {

    private params: any;
    private data: any;

    agInit(params): void {
        this.params = params;
        this.data = params.api.getRowNode(params.rowIndex).data;
        this.data.color = this.params.color || 'white';
    }
}