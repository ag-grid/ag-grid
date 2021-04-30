[[only-angular]]
|
|Below is a simple example of a tooltip component:
|
|```js
|import {Component} from '@angular/core';
|import {ITooltipParams} from "@ag-grid-community/core";
|import {ITooltipAngularComp} from "@ag-grid-community/angular";
|
|@Component({
|    selector: 'tooltip-component',
|    template: `
|      <div class="custom-tooltip" [style.background-color]="color">
|          <p><span>{{ data.athlete }}</span></p>
|          <p><span>Country: </span>{{ data.country }}</p>
|          <p><span>Total: </span>{{ data.total }}</p>
|      </div>`,
|    styles: [
|        `
|            :host {
|                position: absolute;
|                width: 150px;
|                height: 70px;
|                pointer-events: none;
|                transition: opacity 1s;
|            }
|
|            :host.ag-tooltip-hiding {
|                opacity: 0;
|            }
|
|            .custom-tooltip p {
|                margin: 5px;
|                white-space: nowrap;
|            }
|
|            .custom-tooltip p:first-of-type {
|                font-weight: bold;
|            }
|        `
|    ]
|})
|export class CustomTooltip implements ITooltipAngularComp {
|    private params: {color: string} & ITooltipParams;
|    private data: any[];
|    private color: string;
|
|    agInit(params: {color: string} & ITooltipParams): void {
|        this.params = params;
|
|        this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
|        this.color = this.params.color || 'white';
|    }
|}
|```
