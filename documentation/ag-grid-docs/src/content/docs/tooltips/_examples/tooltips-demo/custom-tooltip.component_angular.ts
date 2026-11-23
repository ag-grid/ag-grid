import { Component } from '@angular/core';

import type { ITooltipAngularComp } from 'ag-grid-angular';
import type { ITooltipParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: ` <div class="custom-tooltip" [style.background-color]="color">
        <div><b>Custom Tooltip</b></div>
        <div>{{ params.value }}</div>
    </div>`,
    styles: [
        `
            :host {
                position: absolute;
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
        `,
    ],
})
export class CustomTooltip implements ITooltipAngularComp {
    params!: { color: string } & ITooltipParams;
    color!: string;

    agInit(params: { color: string } & ITooltipParams): void {
        this.params = params;
        this.color = this.params.color || '#999';
    }
}
