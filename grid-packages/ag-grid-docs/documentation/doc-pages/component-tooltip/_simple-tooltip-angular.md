<framework-specific-section frameworks="angular">
|
|Below is an example of a tooltip component:
|
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|import {Component} from '@angular/core';
|import {ITooltipParams} from "ag-grid-community";
|import {ITooltipAngularComp} from "ag-grid-angular";
|
|@Component({
|    selector: 'tooltip-component',
|    template: `
|      &lt;div class="custom-tooltip" [style.background-color]="color">
|          &lt;p>&lt;span>{{ data.athlete }}&lt;/span>&lt;/p>
|          &lt;p>&lt;span>Country: &lt;/span>{{ data.country }}&lt;/p>
|          &lt;p>&lt;span>Total: &lt;/span>{{ data.total }}&lt;/p>
|      &lt;/div>`,
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
|    private params!: {color: string} & ITooltipParams;
|    public data!: any;
|    public color!: string;
|
|    agInit(params: {color: string} & ITooltipParams): void {
|        this.params = params;
|
|        this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
|        this.color = this.params.color || 'white';
|    }
|}
</snippet>
</framework-specific-section>
