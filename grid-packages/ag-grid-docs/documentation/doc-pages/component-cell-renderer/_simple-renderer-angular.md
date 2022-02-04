[[only-angular]]
|Below is a simple example of cell renderer class:
|
|```js
|import {Component} from "@angular/core";
|import {ICellRendererAngularComp} from '@ag-grid-community/angular';
|import {ICellRendererParams} from "@ag-grid-community/core";
|
|@Component({
|    selector: 'total-value-component',
|    template: `
|          <span>
|              <span>{{cellValue}}</span>&nbsp;
|              <button (click)="buttonClicked()">Push For Total</button>
|          </span>
|    `
|})
|export class TotalValueRenderer implements ICellRendererAngularComp {
|    private cellValue: string;
|
|    // gets called once before the renderer is used
|    agInit(params: ICellRendererParams): void {
|        this.cellValue = this.getValueToDisplay(params);
|    }
|
|    // gets called whenever the cell refreshes
|    refresh(params: ICellRendererParams) {
|        // set value into cell again
|        this.cellValue = this.getValueToDisplay(params);
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
|```
