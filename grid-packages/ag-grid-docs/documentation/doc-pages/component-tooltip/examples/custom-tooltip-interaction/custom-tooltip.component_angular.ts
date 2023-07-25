import { Component } from '@angular/core';
import { ITooltipParams } from "@ag-grid-community/core";
import { ITooltipAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'tooltip-component',
    template: `
        <div class="custom-tooltip">
            <div [ngClass]="'panel panel-' + type">
            <div class="panel-heading">
                <h3 class="panel-title">{{data.country}}</h3>
            </div>
            <form class="panel-body" (submit)="onFormSubmit($event)">
                <div class="form-group">
                    <input type="text" class="form-control" id="name" placeholder="Name" value="{{data.athlete}}">
                    <button type="submit" class="btn btn-primary">Submit</button>
                </div>
                <p>Total: {{data.total}}</p>
            </form>
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

    private params!: { type: string } & ITooltipParams;
    public data!: any;
    public type!: string;

    agInit(params: { type: string } & ITooltipParams): void {
        this.params = params;

        this.data = params.api!.getDisplayedRowAtIndex(params.rowIndex!)!.data;
        this.type = this.params.type || 'primary';
    }

    onFormSubmit(e: Event) {
        e.preventDefault();

        const { node, column } = this.params;

        const input = (e.target as HTMLElement).querySelector('input') as HTMLInputElement;

        if (input.value) {
            node?.setDataValue(column as any, input.value);

            if (this.params.hideTooltipCallback) {
                this.params.hideTooltipCallback();
            }
        }
    }
}
