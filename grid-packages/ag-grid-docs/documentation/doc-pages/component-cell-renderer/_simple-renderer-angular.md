<framework-specific-section frameworks="angular">
Below is an example of cell renderer class:
<snippet transform={false} language="ts">
|import {Component} from "@angular/core";
|import {ICellRendererAngularComp} from 'ag-grid-angular';
|import {ICellRendererParams} from "ag-grid-community";
|
|@Component({
|    selector: 'total-value-component',
|    template: `
|          &lt;span>
|              &lt;span>{{cellValue}}&lt;/span>&nbsp;
|              &lt;button (click)="buttonClicked()">Push For Total&lt;/button>
|          &lt;/span>
|    `
|})
|export class TotalValueRenderer implements ICellRendererAngularComp {
|    public cellValue: string;
|
|    // gets called once before the renderer is used
|    agInit(params: ICellRendererParams): void {
|        this.cellValue = this.getValueToDisplay(params);
|    }
|
|    // gets called whenever the cell refreshes
|    refresh(params: ICellRendererParams): boolean {
|        // set value into cell again
|        this.cellValue = this.getValueToDisplay(params);
|        return true;
|    }
|
|    buttonClicked() {
|        alert(`${this.cellValue} medals won!`)
|    }
|
|    getValueToDisplay(params: ICellRendererParams) {
|        return params.valueFormatted ? params.valueFormatted : params.value;
|    }
|}
</snippet>
</framework-specific-section>