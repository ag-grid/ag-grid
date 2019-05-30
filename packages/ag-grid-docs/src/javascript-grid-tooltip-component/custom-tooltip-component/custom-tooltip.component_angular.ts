import {Component, ViewEncapsulation} from '@angular/core';
import {ITooltipAngularComp} from "ag-grid-angular";

@Component({
    selector: 'tooltip-component',
    template: `
        <div class="custom-tooltip" [style.background-color]="data.color">
            <p><span>{{data.athlete}}</span></p>
            <p><span>Country: </span>{{data.country}}</p>
            <p><span>Total: </span>{{data.total}}</p>
        </div>`,
    styles: [
        `
            :host {
                position: absolute;
                width: 150px;
                height: 70px;
                border: 1px solid cornflowerblue;
                overflow: hidden;
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
        this.data.color = this.params.color || 'white';
    }
}
