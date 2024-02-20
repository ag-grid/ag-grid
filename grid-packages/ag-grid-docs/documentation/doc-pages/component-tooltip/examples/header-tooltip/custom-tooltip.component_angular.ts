import { Component } from '@angular/core';
import { ITooltipAngularComp } from "@ag-grid-community/angular";
import { ITooltipParams } from '@ag-grid-community/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
    standalone: true,
    imports: [NgIf, NgFor],
    template: `
        <div class="custom-tooltip custom-tooltip-grouped" *ngIf="isHeader">
            <span>Group Name: {{params.value}}</span>
            <span *ngFor="let header of params.colDef.children; let idx = index">
                Child {{(idx + 1)}} - {{header.headerName}}
            </span>
        </div>
        <div class="custom-tooltip" *ngIf="!isHeader">
            <span>Athlete's Name:</span>
            <span>{{valueToDisplay}}</span>
        </div>`
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
