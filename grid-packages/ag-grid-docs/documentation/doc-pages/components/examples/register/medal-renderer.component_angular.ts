import {Component} from "@angular/core";
import {ICellRendererAngularComp} from '@ag-grid-community/angular';
import {ICellRendererParams} from "@ag-grid-community/core";

@Component({
    selector: 'total-value-component',
    template: `
        <span>
             <span>{{country}}</span>&nbsp;
             <button (click)="buttonClicked()">Push For Total</button>
        </span>
    `
})
export class MedalRenderer implements ICellRendererAngularComp {
    public country: string = '';
    public total: string = '';

    // gets called once before the renderer is used
    agInit(params: ICellRendererParams): void {
        this.country = params.valueFormatted ? params.valueFormatted : params.value;
        this.total = params.data.total;
    }

    refresh(params: ICellRendererParams) {
        return false;
    }

    buttonClicked() {
        alert(`${this.total} medals won!`)
    }
}
