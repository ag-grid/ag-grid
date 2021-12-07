import { Component } from '@angular/core';
import { ITooltipAngularComp } from "@ag-grid-community/angular";
import { ITooltipParams } from '@ag-grid-community/core';

@Component({
    selector: 'tooltip-component',
    template: `
        <div class="custom-tooltip" *ngIf="isHeader">
            <p>Group Name: {{params.value}}</p>
            <hr *ngIf="isGroupedHeader" />
            <div *ngIf="isGroupedHeader">
                <p *ngFor="let header of params.colDef.children; let idx = index">
                    Child {{(idx + 1)}} - {{header.headerName}}
                </p>
            </div>
        </div>
        <div class="custom-tooltip" *ngIf="!isHeader">
            <p><span>Athlete's Name:</span></p>
            <p>{{valueToDisplay}}</p>
        </div>`,
    styles: [
        `
            :host {
                position: absolute;
                width: 165px;
                height: 80px;
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

    public params!: ITooltipParams;
    public valueToDisplay!: string;
    public isHeader!: boolean;
    public isGroupedHeader!: boolean;

    agInit(params: ITooltipParams): void {
        this.params = params;
        this.isHeader = params.rowIndex === undefined;
        this.isGroupedHeader = !!(params.colDef && (params.colDef as any).children);
        this.valueToDisplay = params.value.value ? params.value.value : '- Missing -';
    }
}
