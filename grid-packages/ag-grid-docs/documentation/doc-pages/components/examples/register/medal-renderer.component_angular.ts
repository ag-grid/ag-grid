import {Component} from "@angular/core";
import {ICellRendererAngularComp} from '@ag-grid-community/angular';
import {ICellRendererParams} from "@ag-grid-community/core";

@Component({
    selector: 'total-value-component',
    template: `
        <span>
             <span>{{cellValue}}</span>&nbsp;
             <button (click)="buttonClicked()">Push For Total</button>
        </span>
    `
})
export class MedalRenderer implements ICellRendererAngularComp {
    public cellValue: string = '';

    // gets called once before the renderer is used
    agInit(params: ICellRendererParams): void {
        this.cellValue = params.valueFormatted ? params.valueFormatted : params.value;
    }

    refresh(params: ICellRendererParams) {
        return false;
    }

    buttonClicked() {
        alert(`${this.cellValue} medals won!`)
    }
}
