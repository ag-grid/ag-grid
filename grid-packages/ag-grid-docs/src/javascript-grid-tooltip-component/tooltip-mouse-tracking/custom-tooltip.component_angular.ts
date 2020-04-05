import {Component, ViewEncapsulation} from '@angular/core';
import {ITooltipAngularComp} from "@ag-grid-community/angular";

@Component({
    selector: 'tooltip-component',
    template: `
        <div class="custom-tooltip">
            <div [ngClass]="'panel panel-' + data.type">
            <div class="panel-heading">
                <h3 class="panel-title">{{data.country}}</h3>
            </div>
            <div class="panel-body">
                <h4 [ngStyle]="{whiteSpace:'nowrap'}">{{data.athlete}}</h4>
                <p>Total: {{data.total}}</p>
            </div>
        </div>`,
    styles: [
        `
            :host {
                position: absolute;
                overflow: visible;
                pointer-events: none;
                transition: opacity 1s;
            }

            :host.ag-tooltip-hiding {
                opacity: 0;
            }

            .custom-tooltip p {
                margin: 5px;
                white-space: nowrap;
            }

            .custom-tooltip p:first-of-type {
                font-weight: bold;
            }
        `
    ]
})
export class CustomTooltip implements ITooltipAngularComp {

    private params: any;
    private data: any;

    agInit(params): void {
        this.params = params;

        this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
        this.data.type = this.params.type || 'primary';
    }
}
