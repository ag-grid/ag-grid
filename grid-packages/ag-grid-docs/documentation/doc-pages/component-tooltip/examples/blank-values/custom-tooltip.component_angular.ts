import { Component } from '@angular/core';
import { ITooltipParams } from "@ag-grid-community/core";
import { ITooltipAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'tooltip-component',
    template: `
      <div class="custom-tooltip">
      <p><span>Athlete's Name:</span></p>
      <p>{{ valueToDisplay }}</p>
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

    private params!: ITooltipParams;
    public valueToDisplay!: string;

    agInit(params: ITooltipParams): void {
        this.params = params;
        this.valueToDisplay = this.params.value.value ? this.params.value.value : '- Missing -';
    }
}
