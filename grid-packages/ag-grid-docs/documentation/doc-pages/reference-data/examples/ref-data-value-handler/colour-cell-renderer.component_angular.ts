import {Component} from "@angular/core";
import {ICellRendererParams} from "@ag-grid-community/core";
import {ICellRendererAngularComp} from "@ag-grid-community/angular";

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    selector: 'simple-component',
    template: `
        <div *ngIf="params.value === '(Select All)'; else elseBlock">{{params.value}}</div>
        <ng-template #elseBlock><span [style.color]="removeSpaces(params.valueFormatted)">{{params.valueFormatted}}</span></ng-template>
    `
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh() {
        return false
    }

    removeSpaces(str: string) {
        return str ? str.replace(/\s/g, '') : str
    }
}
